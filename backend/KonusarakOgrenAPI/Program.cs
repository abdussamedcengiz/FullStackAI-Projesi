using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ✅ appsettings.json'dan oku
var connStr = builder.Configuration.GetConnectionString("DefaultConnection") 
              ?? "Data Source=chat.db";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connStr));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        b => b.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.MapControllers();

// ✅ Uygulama açılırken migrasyonları uygula (yoksa DB’yi oluşturur)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate(); // Migrations varsa uygular; yoksa hata vermez, ama önce migration eklemen gerekir
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
