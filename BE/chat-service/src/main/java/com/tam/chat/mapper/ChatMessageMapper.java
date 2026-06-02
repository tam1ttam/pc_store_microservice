package com.tam.chat.mapper;

import java.util.List;

import org.mapstruct.Mapper;

import com.tam.chat.dto.request.ChatMessageRequest;
import com.tam.chat.dto.response.ChatMessageResponse;
import com.tam.chat.entity.ChatMessage;

@Mapper(componentModel = "spring")
public interface ChatMessageMapper {
    ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage);

    ChatMessage toChatMessage(ChatMessageRequest request);

    List<ChatMessageResponse> toChatMessageResponses(List<ChatMessage> chatMessages);
}
