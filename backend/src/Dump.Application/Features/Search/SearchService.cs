using System.Collections.Generic;
using System.Threading.Tasks;

namespace Dump.Application.Features.Search
{
    public class SearchService
    {
        private readonly ISearchRepository _searchRepository;

        public SearchService(ISearchRepository searchRepository)
        {
            _searchRepository = searchRepository;
        }
        public async Task<SearchResultDto> SearchAsync(string query)
        {
            var users = await _searchRepository.SearchUsersAsync(query);
            var posts = await _searchRepository.SearchPostsAsync(query);

            return new SearchResultDto
            {
                Users = users,
                Posts = posts
            };
        }
    }

}
