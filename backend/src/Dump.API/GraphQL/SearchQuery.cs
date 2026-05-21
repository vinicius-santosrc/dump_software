using System.Threading.Tasks;
using Dump.Application.Features.Search;

namespace Dump.API.GraphQL
{
    public class SearchQuery
    {
        public async Task<SearchResultDto> Search(
            string query,
            [Service] SearchService searchService)
        {
            return await searchService.SearchAsync(query);
        }
    }
}