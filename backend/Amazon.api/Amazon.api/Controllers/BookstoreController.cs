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

    /// <summary>
    /// Distinct category names for the React category filter.
    /// </summary>
    [HttpGet("GetBookCategories")]
    public IEnumerable<string> GetBookCategories()
    {
        return _context.Books
            .Where(b => b.Category != null && b.Category != string.Empty)
            .Select(b => b.Category!)
            .Distinct()
            .OrderBy(c => c)
            .ToList();
    }

    /// <summary>
    /// Optional query: ?categories=A&amp;categories=B — when omitted or empty, returns all books.
    /// </summary>
    [HttpGet("GetBooks")]
    public IEnumerable<Book> GetBooks([FromQuery] List<string>? categories)
    {
        IQueryable<Book> query = _context.Books;

        if (categories is { Count: > 0 })
        {
            query = query.Where(b => b.Category != null && categories.Contains(b.Category));
        }

        return query.ToList();
    }

    /// <summary>
    /// Creates a new book. The database assigns <see cref="Book.BookID"/>; any value in the body is ignored.
    /// </summary>
    [HttpPost("AddBook")]
    [ProducesResponseType(typeof(Book), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult<Book> AddBook([FromBody] Book book)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        book.BookID = 0;
        _context.Books.Add(book);
        _context.SaveChanges();

        return CreatedAtAction(nameof(GetBooks), new { }, book);
    }

    /// <summary>
    /// Updates an existing book. The route <paramref name="id"/> must match <see cref="Book.BookID"/> in the body (or body id can be 0).
    /// </summary>
    [HttpPut("UpdateBook/{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult UpdateBook(int id, [FromBody] Book book)
    {
        if (book == null)
            return BadRequest();

        if (book.BookID != 0 && book.BookID != id)
            return BadRequest("BookID in the body must match the route id.");

        var existing = _context.Books.Find(id);
        if (existing == null)
            return NotFound();

        book.BookID = id;
        _context.Entry(existing).CurrentValues.SetValues(book);
        _context.SaveChanges();

        return NoContent();
    }

    /// <summary>
    /// Deletes a book by primary key.
    /// </summary>
    [HttpDelete("DeleteBook/{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult DeleteBook(int id)
    {
        var book = _context.Books.Find(id);
        if (book == null)
            return NotFound();

        _context.Books.Remove(book);
        _context.SaveChanges();

        return NoContent();
    }
}