# ETL Workflow Documentation

## Overview

This n8n workflow (`etl.json`) implements a sophisticated Extract-Transform-Load (ETL) pipeline for processing various types of content (documents, videos, audio) and storing them in a vector database. The workflow handles multiple content types and sources, including:

- PDF documents
- YouTube videos
- Google Drive files and folders
- Web pages
- Audio files

## Workflow Architecture

### Input Processing
1. **Entry Point**: `subflow_trigger` node - accepts input with URL and metadata
2. **Initial Checks**:
   - `folder_check`: Determines if URL points to a folder
   - `video_check`: Identifies YouTube content
   - `binary_check`: Verifies binary content presence

### Content Processing Paths

#### 1. Document Processing
- **PDF Handling**: 
  - Node: `pdf_parser_service`
  - Endpoint: `text-convertor-v4.onrender.com/extract`
  - Processes PDF files and extracts text content

#### 2. Video Processing
- **YouTube Processing**:
  - Node: `yt_dlp_service`
  - Endpoint: Custom service for YouTube content extraction
  - Followed by merge operations to maintain context

#### 3. Web Content
- **HTML Processing**:
  - Node: `html_parser_service`
  - Endpoint: `text-convertor-v4.onrender.com/clean`
  - Handles web page content extraction
- **Puppeteer Fallback**:
  - Node: `puppeteer`
  - Used when direct HTTP requests fail

#### 4. Audio Processing
- **Audio Transcription**:
  - Node: `Transcribe audio or video`
  - Uses ElevenLabs API for audio-to-text conversion

### Google Drive Integration
- **Folder Processing**:
  - Node: `list files`
  - Recursively lists files in Google Drive folders
  - Handles Google Docs export to PDF
- **File Download**:
  - Node: `download_files`
  - Manages file downloads with proper MIME type handling

### Vector Storage
- **Text Processing**:
  - Node: `Recursive Character Text Splitter`
  - Chunks text for optimal vector storage
- **Embeddings**:
  - Node: `Embeddings OpenAI2`
  - Creates embeddings using OpenAI's API
- **Storage**:
  - Node: `Qdrant Vector Store2`
  - Stores processed content in Qdrant vector database

## Key Features

1. **Recursive Processing**:
   - Handles nested folder structures
   - Maintains context across processing steps

2. **Error Handling**:
   - Checks for HTTP errors and redirects
   - Provides fallback mechanisms for content extraction

3. **Metadata Preservation**:
   - Maintains original source information
   - Tracks content provenance

4. **Flexible Content Types**:
   - Adapts processing based on content type
   - Supports multiple input formats

## Dependencies

1. **External Services**:
   - OpenAI API (embeddings)
   - ElevenLabs (audio transcription)
   - Custom text conversion services
   - Qdrant vector database

2. **API Credentials**:
   - OpenAI API key
   - ElevenLabs API key
   - Google Drive API key
   - YouTube API credentials

## Usage Notes

1. **Input Requirements**:
   - URL must be provided
   - Optional metadata enhances content context

2. **Processing Considerations**:
   - Large files may require longer processing time
   - YouTube content processed asynchronously
   - Google Drive folders processed recursively

3. **Output**:
   - Processed content stored in Qdrant
   - Maintains original metadata
   - Includes source tracking

## Status

The workflow is currently marked as inactive (`"active": false`) in the configuration.

---

For detailed implementation of specific features or modifications to the workflow, refer to the node configurations in `etl.json`.