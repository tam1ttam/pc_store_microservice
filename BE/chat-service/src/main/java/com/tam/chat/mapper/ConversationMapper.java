package com.tam.chat.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import com.tam.chat.dto.response.ConversationResponse;
import com.tam.chat.entity.Conversation;

@Mapper(componentModel = "spring")
public interface ConversationMapper {
    ConversationResponse toConversationResponse(Conversation conversation);

    List<ConversationResponse> toConversationResponseList(List<Conversation> conversations);
}
