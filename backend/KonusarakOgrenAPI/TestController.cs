using Microsoft.AspNetCore.Mvc;

namespace KonusarakOgrenAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetMessage()
        {
            return Ok(new { message = "Backend API çalışıyor 🚀" });
        }
    }
}
