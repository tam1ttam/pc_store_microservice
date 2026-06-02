package com.tam.file.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.tam.file.entity.UploadedFile;

@Repository
public interface UploadedFileRepository extends MongoRepository<UploadedFile, String> {
    List<UploadedFile> findByFileType(String fileType);
}
