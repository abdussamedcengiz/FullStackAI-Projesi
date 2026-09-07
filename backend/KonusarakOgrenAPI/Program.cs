using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- VERITABANI ---
var connStr = builder.Configuration.GetConnectionString("DefaultConnection")
              ?? "Data Source=chat.db";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connStr));

// --- AI SERVISI ---
//
// Adres artik KODA GOMULU DEGIL. Onceki surumde ChatController'in
// icinde bir YER TUTUCU vardi ("kendi-hf-space-urliniz.hf.space"),
// yani ozellik hicbir kurulumda calismiyordu.
//
// Varsayilan olarak yereldeki ai-service'i gosteriyor
// (ai-service/app.py, uvicorn 8000 portunda).
var aiBaseUrl = builder.Configuration["AiService:BaseUrl"]
                ?? "http://localhost:8000";

builder.Services.AddHttpClient("ai", client =>
{
    client.BaseAddress = new Uri(aiBaseUrl);

    // Zaman asimi SART: AI modeli ilk istekte yavas olabilir, ama
    // sinirsiz beklemek istegi ve onunla birlikte bir is parcacigini
    // suresiz tutar. Varsayilan 100 saniye bu is icin cok uzun.
    client.Timeout = TimeSpan.FromSeconds(10);
});

// --- CORS ---
//
// Izin verilen adresler yapilandirmadan geliyor. Onceden
// AllowAnyOrigin() vardi: internetteki HERHANGI bir sayfa
// tarayicidan bu API'ye istek atabilirdi.
//
// Yapilandirmada bir sey yoksa gelistirme adreslerine izin veriyoruz.
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? new[]
    {
        "http://localhost:3000", // web-chat (Create React App)
        "http://localhost:8081"  // Expo web
    };

builder.Services.AddCors(options =>
{
    options.AddPolicy("Default", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // Canlida HTTPS yonlendirmesi anlamli; gelistirmede kapali
    // birakiyoruz cunku yerel istemciler http kullaniyor ve
    // yonlendirme CORS on kontrol isteklerini bozabiliyor.
    app.UseHttpsRedirection();
}

app.UseCors("Default");
app.MapControllers();

// Acilista migration'lari uygula (veritabani yoksa olusturur).
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.Run();

// --- Entities & DbContext ---

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Message> Messages => Set<Message>();
}

public class User
{
    public int Id { get; set; }
    public string Nickname { get; set; } = string.Empty;
    public ICollection<Message>? Messages { get; set; }
}

public class Message
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public string Sentiment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int UserId { get; set; }
    public User? User { get; set; }
}
