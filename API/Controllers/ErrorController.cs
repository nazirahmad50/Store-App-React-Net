namespace API.Controllers;

public class ErrorController : BaseApiController
{
    [HttpGet("not-found")]
    public IActionResult GetNotFound()
    {
        return NotFound();
    }

    [HttpGet("bad-request")]
    public IActionResult GetBadRequest()
    {
        return BadRequest(new ProblemDetails { Title = "This is a bad request" });
    }

    [HttpGet("unauthorised")]
    public IActionResult GetUnauthorised()
    {
        return Unauthorized();
    }

    [HttpGet("validation-error")]
    public IActionResult GetValidationError()
    {
        ModelState.AddModelError("Problem1", "This is the first error");
        ModelState.AddModelError("Problem2", "This is the first error");
        return ValidationProblem();

    }

    [HttpGet("server-error")]
    public IActionResult GetServerError()
    {
        throw new Exception("This IS A SERVER ERROR");
    }
}

