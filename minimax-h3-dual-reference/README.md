# MiniMax H3 双参考图生视频工作流

这是一个可直接导入 ComfyUI 的 MiniMax H3 Reference-to-Video 工作流。它接受两张参考图，可分别用于人物身份、服装、产品或视觉风格参考，并生成带音频轨道的视频。

## 文件

- [`MiniMax_H3_Dual_Reference.json`](./MiniMax_H3_Dual_Reference.json)：ComfyUI 工作流文件。

## 环境要求

- 支持 `MiniMaxH3ReferenceToVideo` 节点的较新版本 ComfyUI；工作流保存时的前端版本为 `1.49.6`。
- 足够的显存和磁盘空间。工作流默认使用 INT8 视频模型与 INT8 文本编码器，以降低显存占用。
- 模型文件需自行下载，仓库不包含模型权重。

## 模型文件

将以下文件放入对应的 ComfyUI 模型目录：

| 文件 | 目录 | 下载地址 |
| --- | --- | --- |
| `minimax_h3_ref2va_pruned_int8_convrot.safetensors` | `ComfyUI/models/diffusion_models/` | [Comfy-Org / MiniMax-H3](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/diffusion_models/minimax_h3_ref2va_pruned_int8_convrot.safetensors) |
| `minimax_h3_video_vae_fp16.safetensors` | `ComfyUI/models/vae/` | [Comfy-Org / MiniMax-H3](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/vae/minimax_h3_video_vae_fp16.safetensors) |
| `minimax_h3_audio_vae_fp32.safetensors` | `ComfyUI/models/vae/` | [Comfy-Org / MiniMax-H3](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/vae/minimax_h3_audio_vae_fp32.safetensors) |
| `qwen3vl_32b_h3_ultra_uncensored_heretic_int8_convrot.safetensors` | `ComfyUI/models/text_encoders/` | 工作流使用的第三方编码器，请从你获得该模型的可信来源下载。也可以在导入后改选本机已有、兼容 MiniMax H3 的 Qwen3-VL 32B 编码器。 |

Comfy-Org 同时提供官方 INT8 编码器 `qwen3vl_32b_minimax_h3_int8_convrot.safetensors`。如需使用它，请先[下载模型](https://huggingface.co/Comfy-Org/MiniMax-H3/resolve/main/text_encoders/qwen3vl_32b_minimax_h3_int8_convrot.safetensors)，再在工作流的文本编码器节点中手动切换文件。

## 使用方法

1. 下载本目录中的 JSON 文件。
2. 打开 ComfyUI，将 JSON 拖入画布或通过 **Workflow → Open** 导入。
3. 在 **① 参考图 1** 和 **② 参考图 2** 中选择图片。
4. 在 **③ 提示词** 中用 `<Picture 1>` 和 `<Picture 2>` 指定两张图的用途，并补充动作、场景、对白与声音要求。
5. 选择分辨率和视频时长，点击 **运行**。
6. 生成结果默认保存到 `ComfyUI/output/video/MiniMax_H3_Dual_Reference/`。

## 默认参数

- 画面比例：`16:9`
- 采样步数：`20`
- 采样器：`res_multistep`
- 帧率：`24 fps`
- 默认时长：`5 秒`
- 参考图尺寸：`max`，优先保持人物身份与关键外观细节

## 注意事项

- 两张参考图的主体、光线和画面风格越清晰，生成结果通常越稳定。
- 提示词必须保留 `<Picture 1>` 和 `<Picture 2>` 标记，模型才能正确区分参考图。
- 第一次导入后若节点显示缺失，请先更新 ComfyUI，再重新加载工作流。
- 模型文件体积较大，下载前请确认磁盘空间，并遵守对应模型的许可证和使用限制。
