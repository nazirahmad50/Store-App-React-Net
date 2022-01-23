namespace API.Controllers;

[Authorize]
public class OrdersController : BaseApiController
{
    private readonly StoreContext context;

    public OrdersController(StoreContext context)
    {
        this.context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<OrderDto>>> GetOrders()
    {
        return await context.Orders
            .MapOrderToOrderDto()
            .Where(x => x.BuyerId == User.Identity.Name)
            .ToListAsync();
    }

    [HttpGet("{id}", Name = "GetOrder")]
    public async Task<ActionResult<OrderDto>> GetOrder(int id)
    {
        return await context.Orders
            .MapOrderToOrderDto()
            .Where(x => x.BuyerId == User.Identity.Name && x.Id == id)
            .FirstOrDefaultAsync();
    }

    [HttpPost]
    public async Task<ActionResult<int>> CreateOrder(CreateOrderDto orderDto)
    {
        var basket = await context.Baskets
            .RetrieveBasketWithItems(User.Identity.Name)
            .FirstOrDefaultAsync();

        if (basket == null) return BadRequest(new ProblemDetails { Title = "Could not locate basket" });

        var items = new List<OrderItem>();

        foreach (var item in basket.Items)
        {
            var productItem = await context.Products.FindAsync(item.ProductId);

            var itemOrdered = new ProductItemOrdered
            {
                ProductId = productItem.Id,
                Name = productItem.Name,
                PictureUrl = productItem.PictureUrl
            };

            var orderItem = new OrderItem
            {
                ItemOrdered = itemOrdered,
                Price = productItem.Price,
                Quantity = item.Quantity
            };

            items.Add(orderItem);
            productItem.QuantityInStock -= item.Quantity;
        }

        var subtotal = items.Sum(x => x.Price * x.Quantity);
        var deliveryFee = subtotal > 10000 ? 0 : 500;

        var order = new Order
        {
            OrderItems = items,
            BuyerId = User.Identity.Name,
            ShippingAddress = orderDto.ShippingAddress,
            Subtotal = subtotal,
            DeliveryFee = deliveryFee,
            PaymentIntentId = basket.PaymentIntentId,
        };

        context.Orders.Add(order);
        context.Baskets.Remove(basket);

        if (orderDto.SaveAddress)
        {
            var user = await context.Users
                .Include(x => x.Address)
                .FirstOrDefaultAsync(x => x.UserName == User.Identity.Name);

            var address = new UserAddress
            {
                FullName = orderDto.ShippingAddress.FullName,
                Address1 = orderDto.ShippingAddress.FullName,
                Address2 = orderDto.ShippingAddress.FullName,
                City = orderDto.ShippingAddress.FullName,
                State = orderDto.ShippingAddress.FullName,
                Zip = orderDto.ShippingAddress.FullName,
                Country = orderDto.ShippingAddress.FullName,
            };

            user.Address = address;
            context.Update(user);
        }

        var result = await context.SaveChangesAsync() > 0;

        if (result) return CreatedAtRoute("GetOrder", new { id = order.Id }, order.Id);

        return BadRequest("Problem creating order");
    }
}

