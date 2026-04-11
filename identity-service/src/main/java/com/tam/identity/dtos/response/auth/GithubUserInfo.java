package com.tam.identity.dtos.response.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GithubUserInfo {
    private String id;
    
    private String login;
    
    private String name;
    
    private String avatar_url;
    
    private String bio;
    
    private String email;
    
    @JsonProperty("public_repos")
    private Integer publicRepos;
    
    @JsonProperty("followers")
    private Integer followers;
}
