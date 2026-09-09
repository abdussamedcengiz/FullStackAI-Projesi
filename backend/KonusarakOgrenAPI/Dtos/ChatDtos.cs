using System.ComponentModel.DataAnnotations;

namespace KonusarakOgrenAPI.Dtos;

/// <summary>
/// Mesaj gonderme istegi.
///
/// NEDEN AYRI BIR DTO?
/// Onceki surumde controller dogrudan "Message" varligini bagliyordu:
///     SendMessage([FromBody] Message message)
///
/// Bu, istemcinin varligin TUM alanlarini doldurabilmesi demekti --
/// Id, Sentiment ve CreatedAt dahil. Yani istemci "Sentiment" degerini
/// kendisi yazip AI analizini atlayabilir, CreatedAt'i gecmise cekip
/// mesaj siralamasini bozabilirdi. Buna "over-posting" (asiri baglama)
/// denir.
///
/// DTO yalnizca istemciden GERCEKTEN gelmesi gereken alanlari icerir.
/// </summary>
public class SendMessageRequest
{
    [Required(ErrorMessage = "Mesaj metni zorunludur.")]
    // Onceden hicbir uzunluk siniri yoktu: 10 MB'lik bir metin
    // dogruca veritabanina ve AI servisine gidiyordu.
    [StringLength(1000, MinimumLength = 1, ErrorMessage = "Mesaj 1-1000 karakter olmalidir.")]
    public string Text { get; set; } = string.Empty;

    /// <summary>
    /// Mesaji gonderen kullanici.
    ///
    /// DIKKAT: Bu deger ISTEMCIDEN geliyor ve projede henuz kimlik
    /// dogrulama YOK. Yani herhangi biri baskasinin kimligiyle mesaj
    /// yazabilir. Gercek bir uygulamada bu alan istekten degil,
    /// dogrulanmis oturumdan (JWT/cookie) alinmalidir.
    ///
    /// Bilerek boyle birakildi -- projeye kimlik dogrulama eklemek
    /// ayri bir istir; buraya not dusuluyor ki eksik gozden kacmasin.
    /// </summary>
    [Range(1, int.MaxValue, ErrorMessage = "Gecerli bir kullanici kimligi gerekir.")]
    public int UserId { get; set; } = 1;
}

/// <summary>
/// Istemciye donen mesaj. Varligin kendisini degil, bunu donuyoruz:
/// varlik ileride yeni alanlar kazanirsa (ornegin bir IP adresi ya da
/// moderasyon notu) bunlar kazara API cevabina sizmaz.
/// </summary>
public class MessageResponse
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public string Sentiment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int UserId { get; set; }
}

/// <summary>
/// AI servisinin (ai-service/app.py) /analyze cevabi.
/// Ornek: { "label": "POSITIVE", "score": 0.99 }
/// </summary>
public class AiAnalyzeResponse
{
    public string? Label { get; set; }
    public double Score { get; set; }
}
