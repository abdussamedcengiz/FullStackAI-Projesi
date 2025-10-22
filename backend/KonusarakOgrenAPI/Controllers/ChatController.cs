using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Json;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly HttpClient _httpClient;

    public ChatController(AppDbContext context)
    {
        _context = context;
        _httpClient = new HttpClient();
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendMessage([FromBody] Message message)
    {
        // AI Servisine istek (gerçek Hugging Face Space endpointini kullanın)
        var aiResponse = await _httpClient.PostAsJsonAsync("https://kendi-hf-space-urliniz.hf.space/analyze", new { text = message.Text });
        var result = await aiResponse.Content.ReadFromJsonAsync<AIResponse>();
        message.Sentiment = result?.label ?? "neutral";

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        return Ok(message);
    }

    [HttpGet]
    public async Task<IActionResult> GetMessages()
    {
        var messages = await _context.Messages.ToListAsync();
        return Ok(messages);
    }

    public class AIResponse
    {
        public string label { get; set; }
    }
}
