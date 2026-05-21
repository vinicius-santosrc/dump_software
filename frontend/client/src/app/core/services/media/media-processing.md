## Visão Geral

O `MediaProcessingService` é um serviço Angular responsável por:

- converter arquivos para Base64,

- obter dimensões de imagens,

- comprimir imagens,

- gerar thumbnails de imagens,

- gerar thumbnails de vídeos,

- comprimir vídeos,

- e processar arquivos automaticamente.

Ele foi criado para facilitar uploads otimizados de mídia em aplicações sociais, chats, posts e sistemas multimídia.

---

# Estrutura do Serviço

```ts

@Injectable({
    providedIn: 'root'
})

```

Isso torna o serviço global no Angular, permitindo usar:

```ts

constructor(private mediaProcessing: MediaProcessingService) {}

```

em qualquer componente ou serviço.

---

# Métodos

# 1. toBase64(file)

## Objetivo

Converter um arquivo (`File`) para Base64.

## Como funciona

Utiliza `FileReader`:

```ts

reader.readAsDataURL(file);

```

Isso gera:

```txt

data:image/png;base64,...

```

## Retorno

```ts

Promise<string>

```

## Uso

```ts

const base64 = await service.toBase64(file);

```

## Quando usar

- preview de imagens,

- upload temporário,

- salvar mídia localmente,

- thumbnails,

- enviar mídia via JSON.

---

# 2. getImageDimensions(base64)

## Objetivo

Descobrir largura e altura da imagem.

## Como funciona

Cria:

```ts

const img = new Image();

```

e espera:

```ts

img.onload

```

Depois retorna:

```ts

img.width

img.height

```

## Retorno

```ts

{

    width: string,

    height: string

}

```

## Uso

```ts

const dimensions = await service.getImageDimensions(base64);

```

---

# 3. compressImage(file)

## Objetivo

Reduzir tamanho da imagem.

## Fluxo

### 1. Converte imagem para Base64

```ts

const base64 = await this.toBase64(file);

```

### 2. Carrega imagem

```ts

img.src = base64;

```

### 3. Redimensiona proporcionalmente

```ts

if (width > MAX_WIDTH)

```

Mantém proporção original.

### 4. Desenha no canvas

```ts

ctx.drawImage(img, 0, 0, width, height);

```

### 5. Exporta imagem comprimida

```ts

canvas.toBlob(..., 'image/jpeg', 0.7);

```

## Qualidade

```ts

0.7

```

- menor valor = menor qualidade + menor tamanho

- maior valor = maior qualidade + maior tamanho

## Retorno

```ts

Promise<File>

```

## Benefícios

- upload mais rápido,

- menos consumo de banda,

- menos armazenamento,

- melhor performance mobile.

---

# 4. generateImageThumbnail(file)

## Objetivo

Gerar miniatura da imagem.

## Diferença para compressImage

- thumbnail = preview pequeno,

- compressão = arquivo final otimizado.

## Tamanho máximo

```ts

MAX_WIDTH = 250

```

## Retorno

```ts

Promise<string>

```

Base64 da thumbnail.

## Uso

Ideal para:

- grids,

- previews,

- stories,

- chats,

- feed.

---

# 5. generateVideoThumbnail(file)

## Objetivo

Capturar frame do vídeo e gerar thumbnail.

## Como funciona

### 1. Cria URL temporária

```ts

URL.createObjectURL(file)

```

### 2. Carrega vídeo

```ts

video.src = url;

```

### 3. Vai para frame específico

```ts

video.currentTime = seekTime;

```

Atualmente:

```ts

Math.min(1, video.duration / 2)

```

ou:

- 1 segundo,

- ou metade do vídeo.

### 4. Desenha frame no canvas

```ts

ctx.drawImage(video, 0, 0, width, height);

```

### 5. Converte para Base64

```ts

canvas.toDataURL('image/jpeg', 0.6);

```

## Retorno

```ts

Promise<string>

```

## Uso

Muito útil para:

- preview de vídeos,

- listas,

- uploads,

- timeline,

- stories.

---

# 6. compressVideo(file)

## Objetivo

Comprimir vídeos diretamente no navegador.

---

# Fluxo Completo

## 1. Cria elemento de vídeo

```ts

const video = document.createElement('video');

```

---

## 2. Define resolução máxima

```ts

MAX_WIDTH = 720

```

---

## 3. Captura frames usando canvas

```ts

canvas.captureStream(30);

```

30 FPS.

---

## 4. Captura áudio

```ts

const audioContext = new AudioContext();

```

Depois conecta:

```ts

createMediaElementSource(video)

```

---

## 5. Junta vídeo + áudio

```ts

new MediaStream([

    ...canvasStream.getVideoTracks(),

    ...destination.stream.getAudioTracks()

]);

```

---

## 6. Define bitrate

```ts

videoBitsPerSecond

```

Bitrate adaptativo:

| Resolução | Bitrate |

|---|---|

| 1080p | 2.5 Mbps |

| 720p | 1.2 Mbps |

| 480p | 700 kbps |

| menor | 400 kbps |

---

## 7. Usa MediaRecorder

```ts

new MediaRecorder(...)

```

Codec:

```txt

vp9 + opus

```

Formato:

```txt

webm

```

---

## 8. Renderiza frame por frame

```ts

requestAnimationFrame(drawFrame);

```

---

## 9. Finaliza gravação

```ts

mediaRecorder.stop();

```

---

## Retorno

```ts

Promise<File>

```

Arquivo `.webm` comprimido.

---

# 7. processFile(file)

## Objetivo

Pipeline principal do sistema.

Esse método:

- detecta tipo do arquivo,

- comprime,

- gera thumbnail,

- coleta dimensões,

- gera Base64 final,

- retorna tudo pronto.

---

# Fluxo

## Imagem

```txt

Imagem

→ Compressão

→ Base64

→ Dimensões

→ Thumbnail

→ Resultado

```

## Vídeo

```txt

Vídeo

→ Compressão

→ Thumbnail

→ Resultado

```

---

# Retorno Final

```ts

{

    url,

    width,

    height,

    type,

    thumbnail

}

```

## Exemplo

```ts

{

    url: "data:image/jpeg;base64,...",

    width: "1080",

    height: "1350",

    type: "image",

    thumbnail: "data:image/jpeg;base64,..."

}

```

---

# Tecnologias Utilizadas

## FileReader

Leitura de arquivos locais.

---

## Canvas API

Manipulação de imagens e frames.

---

## MediaRecorder

Gravação de vídeo.

---

## AudioContext API

Captura e manipulação de áudio.

---

## requestAnimationFrame

Renderização sincronizada com FPS do navegador.

---

# Pontos Fortes

- compressão no client-side,

- redução de upload,

- thumbnails automáticas,

- sem dependência backend,

- otimizado para redes sociais,

- pipeline unificado,

- preview instantâneo.

---

# Possíveis Melhorias

## 1. Web Workers

Mover processamento pesado para threads separadas.

---

## 2. ffmpeg.wasm

Compressão profissional de vídeo.

---

## 3. Suporte HEIC/HEIF

Compatibilidade iPhone.

---

## 4. Compressão progressiva

Mais controle de qualidade.

---

## 5. Metadata EXIF

Rotação automática de imagens.

---

# Observações Importantes

## Compressão de vídeo no navegador é pesada

Pode consumir:

- CPU,

- RAM,

- bateria.

Principalmente mobile.

---

## MediaRecorder não funciona igual em todos navegadores

Especialmente:

- Safari,

- iOS antigos.

---

## VP9 pode não ter suporte total

Alternativa:

```ts

video/webm;codecs=vp8,opus

```

---

# Conclusão

Esse serviço implementa uma pipeline completa de mídia moderna no frontend:

- compressão,

- thumbnails,

- preview,

- otimização,

- manipulação multimídia,

- vídeo + áudio,

- processamento automático.

É uma excelente base para:

- redes sociais,

- chats,

- uploads,

- stories,

- plataformas multimídia.
