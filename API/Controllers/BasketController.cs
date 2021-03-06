namespace API.Controllers;

public class BasketController : BaseApiController
{
    private readonly StoreContext context;

    public BasketController(StoreContext context)
    {
        this.context = context;
    }

    [HttpGet(Name = "GetBasket")]
    public async Task<ActionResult<BasketDto>> GetBasket()
    {
        Basket basket = await RetrieveBasket(GetBuyerId());

        if (basket == null) return NotFound();

        return basket.MapBaskeToDto();
    }

    [HttpPost]
    public async Task<ActionResult<BasketDto>> AddItemToBasket(int productId, int quantity)
    {
        Basket basket = await RetrieveBasket(GetBuyerId());
        if (basket == null) basket = CreateBasket();

        var product = await context.Products.FindAsync(productId);
        if (product == null) return BadRequest(new ProblemDetails { Title = "Product Not Found" });

        basket.AddItem(product, quantity);

        var result = await context.SaveChangesAsync() > 0;
        if (result) return CreatedAtRoute("GetBasket", basket.MapBaskeToDto());

        return BadRequest(new ProblemDetails { Title = "Problem saving item to basket" });
    }


    [HttpDelete]
    public async Task<ActionResult> RemoveBasketItem(int productId, int quantity)
    {
        Basket basket = await RetrieveBasket(GetBuyerId());
        if (basket == null) return NotFound();

        basket.RemoveItem(productId, quantity);

        var result = await context.SaveChangesAsync() > 0;
        if (result) return Ok();

        return BadRequest(new ProblemDetails { Title = "Problem removng item from basket" });
    }

    private async Task<Basket> RetrieveBasket(string buyerId)
    {
        if (string.IsNullOrEmpty(buyerId))
        {
            Response.Cookies.Delete("buyerId");
            return null;
        }

        return await context.Baskets
                    .Include(i => i.Items)
                    .ThenInclude(p => p.Product)
                    .FirstOrDefaultAsync(x => x.BuyerId == buyerId);
    }

    private string GetBuyerId()
    {
        return User.Identity?.Name ?? Request.Cookies["buyerId"];
    }

    private Basket CreateBasket()
    {
        string buyerId = User.Identity?.Name;

        if (string.IsNullOrEmpty(buyerId))
        {
            buyerId = Guid.NewGuid().ToString();

            var cookieOptions = new CookieOptions
            {
                IsEssential = true,
                Expires = DateTime.Now.AddDays(30),
            };
            Response.Cookies.Append("buyerId", buyerId, cookieOptions);
        }

        Basket basket = new Basket { BuyerId = buyerId };
        context.Add(basket);

        return basket;

    }
}

