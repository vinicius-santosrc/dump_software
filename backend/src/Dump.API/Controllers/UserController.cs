using Microsoft.AspNetCore.Mvc;
using Dump.Application.Features.Auth;
using Dump.Application.DTOs;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Dump.Application.Features.Post;
using Dump.Application.Features.User;
using Dump.Domain.Entities;

namespace Dump.API.Controllers;

[ApiController]
[Route("api/v1/user")]
public class UserController : ControllerBase
{
    private readonly UserService _userService;

    public UserController(UserService userService)
    {
        _userService = userService;
    }

    public class FollowUserRequest
    {
        public string CurrentUserId { get; set; }
        public string TargetUserId { get; set; }
    }

    [HttpGet("getById/{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var user = await _userService.GetById(id);

        if (user == null)
            return NotFound(new { message = "User not found" });

        return Ok(user);
    }

    [HttpGet("{username}")]
    public async Task<IActionResult> GetByUsername(string username)
    {
        var user = await _userService.GetByUsername(username);

        if (user == null)
            return NotFound(new { message = "User not found" });

        return Ok(user);
    }

    [HttpGet("getRelatedByCurrentUser/{id}")]
    public async Task<IActionResult> GetRelatedByCurrentUser(string id)
    {
        var users = await _userService.GetRelatedByCurrentUser(id);
        return Ok(users);
    }

    [HttpPost("follow")]
    public async Task<IActionResult> FollowUser([FromBody] FollowUserRequest request)
    {
        try
        {
            await _userService.FollowUser(request.CurrentUserId, request.TargetUserId);

            return Ok(new
            {
                success = true,
                message = "Follow/unfollow executed successfully"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
    }


    [HttpPost("update")]
    public async Task<IActionResult> Update([FromBody] User user)
    {
        try
        {
            await _userService.Update(user);

            return Ok(new
            {
                success = true,
                message = "User updated sucessfuly"
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
    }

}