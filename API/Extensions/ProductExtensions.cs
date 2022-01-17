using API.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Extensions
{
    public static class ProductExtensions
    {
        public static IQueryable<Product> Sort(this IQueryable<Product> query, string orderBy){

            if (string.IsNullOrEmpty(orderBy)) return query.OrderBy(x => x.Name);

            switch (orderBy)
            {
                case "price":
                    query = query.OrderBy(x => x.Price);
                    break;
                case "priceDesc":
                    query = query.OrderByDescending(x => x.Price);
                    break;
                default:
                    query = query.OrderBy(x => x.Name);
                    break;
            }

            return query;
        }

        public static IQueryable<Product> Search(this IQueryable<Product> query, string searchTerm)
        {

            if (string.IsNullOrEmpty(searchTerm)) return query;

            string lowerCaseSearchTerm = searchTerm.Trim().ToLower();

            return query.Where(x => x.Name.ToLower().Contains(lowerCaseSearchTerm));
        }


        public static IQueryable<Product> Filter(this IQueryable<Product> query, string brands, string types)
        {
            var brandList = new List<string>();
            var typeList = new List<string>();

            if (!string.IsNullOrEmpty(brands)) brandList.AddRange(brands.ToLower().Split(",").ToList());
            if (!string.IsNullOrEmpty(types)) typeList.AddRange(types.ToLower().Split(",").ToList());

            query = query.Where(x => brandList.Count == 0 || brandList.Contains(x.Brand.ToLower()));
            query = query.Where(x => typeList.Count == 0 || typeList.Contains(x.Type.ToLower()));

            return query;
        }
    }
}
