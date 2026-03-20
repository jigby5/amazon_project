using Amazon.api.Data;
using Microsoft.AspNetCore.Mvc;

namespace Amazon.api.Controllers;

[ApiController]
[Route("[controller]")]
public class BookstoreController : ControllerBase
{
    private BookstoreDBContext _context;

    public BookstoreController(BookstoreDBContext context)
    {
        _context = context;
    }

    [HttpGet("GetBooks")]
    public IEnumerable<Book> GetBooks()
    {
        return _context.Books.ToList();
    }
}