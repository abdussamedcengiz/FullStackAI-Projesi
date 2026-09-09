using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Json;
using KonusarakOgrenAPI.Dtos;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<ChatController> _logger;

    // AI servisine ulasilamadiginda kullanilacak deger.
    // Mesaj YINE DE kaydedilir: analiz bir zenginlestirmedir,
    // sohbetin kendisi ona bagimli olmamali.
    private const string UnknownSentiment = "unknown";

    public ChatController(
        AppDbContext context,
        IHttpClientFactory httpClientFactory,
        ILogger<ChatController> logger)
    {
        _context = context;

        // ONCEDEN: "new HttpClient()" her controller ornegi icin
        // yeni bir istemci uretiyordu. ASP.NET Core her istek icin
        // yeni bir controller olusturur; yani her istek yeni bir
        // HttpClient demekti.
        //
        // Bu klasik bir hatadir: HttpClient elden cikarilsa bile
        // altindaki TCP baglantisi bir sure TIME_WAIT durumunda
        // bekler. Yogun trafikte isletim sisteminin soket havuzu
        // tukenir ve istekler "address in use" ile patlar.
        //
        // IHttpClientFactory baglantilari havuzlar ve omurlerini
        // yonetir. Cozum icin dogru arac budur.
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
    {
        // [ApiController] sayesinde model dogrulama otomatik calisir:
        // DTO'daki [Required] / [StringLength] kurallari saglanmazsa
        // bu satira hic gelinmez, ASP.NET Core 400 doner.

        var message = new Message
        {
            Text = request.Text,
            UserId = request.UserId,
            // Sentiment ve CreatedAt ISTEMCIDEN ALINMIYOR.
            // Ikisini de sunucu belirliyor.
            Sentiment = await AnalyzeSentimentAsync(request.Text),
            CreatedAt = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        return Ok(ToResponse(message));
    }

    [HttpGet]
    public async Task<IActionResult> GetMessages([FromQuery] int limit = 100)
    {
        // Onceden ToListAsync() TUM mesajlari donuyordu. Sohbet
        // buyudukce cevap suresiz buyur; istemci de zaten hepsini
        // gostermiyor. Ustten sinirlandiriyoruz.
        var safeLimit = Math.Clamp(limit, 1, 500);

        // Once en YENI kayitlari alip sonra ters ceviriyoruz:
        // "son 100 mesaj" istiyoruz, "ilk 100" degil.
        var latest = await _context.Messages
            .AsNoTracking() // salt okunur sorgu; EF degisiklik takibi yapmasin
            .OrderByDescending(m => m.Id)
            .Take(safeLimit)
            .ToListAsync();

        // Donusum VERITABANI SORGUSUNUN DISINDA yapiliyor.
        // ToResponse'u Select'in icine koysaydik EF onu SQL'e
        // cevirmeye calisir ve "could not be translated" hatasiyla
        // calisma zamaninda patlardi.
        var messages = latest
            .OrderBy(m => m.Id) // istemciye eskiden yeniye dogru gitsin
            .Select(ToResponse)
            .ToList();

        return Ok(messages);
    }

    /// <summary>
    /// Metni AI servisine gonderip duygu etiketini alir.
    ///
    /// ONCEKI SURUMDEKI IKI SORUN:
    ///
    /// 1) Adres KODA GOMULUYDU ve bir yer tutucuydu:
    ///      "https://kendi-hf-space-urliniz.hf.space/analyze"
    ///    Yani bu ozellik hicbir kurulumda CALISMIYORDU. Adres artik
    ///    yapilandirmadan geliyor (appsettings.json -> AiService:BaseUrl).
    ///
    /// 2) Hicbir hata yonetimi yoktu. Servis kapaliysa (ki yer
    ///    tutucu adres yuzunden HER ZAMAN kapaliydi) PostAsJsonAsync
    ///    istisna firlatiyor, istisna yakalanmadigi icin istek 500
    ///    ile olurdu -- mesaj da kaydedilmezdi.
    ///
    ///    Artik analiz BASARISIZ OLABILIR ve bu sohbeti durdurmaz:
    ///    etiket "unknown" olur, mesaj kaydedilir.
    /// </summary>
    private async Task<string> AnalyzeSentimentAsync(string text)
    {
        try
        {
            // "ai" adli istemci Program.cs'te yapilandirildi
            // (temel adres ve zaman asimi orada).
            var client = _httpClientFactory.CreateClient("ai");

            var response = await client.PostAsJsonAsync("/analyze", new { text });

            // ONEMLI: cevabin basarili oldugunu KONTROL EDIYORUZ.
            // Onceden dogrudan ReadFromJsonAsync cagriliyordu; servis
            // 500 ya da bir HTML hata sayfasi donseydi ayristirma
            // asamasinda patlardi.
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "AI servisi {StatusCode} dondu; duygu analizi atlandi.",
                    response.StatusCode);

                return UnknownSentiment;
            }

            var result = await response.Content.ReadFromJsonAsync<AiAnalyzeResponse>();

            // Bos ya da beklenmeyen bicimde bir cevap da basarisizliktir.
            return string.IsNullOrWhiteSpace(result?.Label)
                ? UnknownSentiment
                : result.Label;
        }
        catch (Exception ex)
        {
            // Ag hatasi, zaman asimi, DNS cozulememesi...
            // Kullanicinin mesaji bu yuzden kaybolmamali.
            _logger.LogWarning(ex, "AI servisine ulasilamadi; duygu analizi atlandi.");
            return UnknownSentiment;
        }
    }

    private static MessageResponse ToResponse(Message m) => new()
    {
        Id = m.Id,
        Text = m.Text,
        Sentiment = m.Sentiment,
        CreatedAt = m.CreatedAt,
        UserId = m.UserId
    };
}
