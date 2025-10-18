import { OpenAI } from "RemoteServiceGateway.lspkg/HostedExternal/OpenAI"
import { AudioLooperTracks } from "./AudioLooperTracks"

@component
export class ChatGPT extends BaseScriptComponent {
  private ImageQuality = CompressionQuality.HighQuality
  private ImageEncoding = EncodingType.Jpg

  // Drop your AudioLooperTracks component here in the Inspector
  @input audioLooper: AudioLooperTracks

  onAwake() {}

  makeImageRequest(imageTex: Texture, callback) {
    print("Making image request...")
    Base64.encodeTextureAsync(
      imageTex,
      (base64String) => {
        print("Image encode Success!")
        const textQuery =
          "Based on this photo, write an 4-bar rap battle-style diss about the subject in the photo. Keep it clean, funny, and clever — no profanity. Simple, easy to read on the spot, not too many syllables."
        this.sendGPTChat(textQuery, base64String, (responseText: string) => {
          // 1) Invoke your original callback
          if (callback) {
            callback(responseText)
          }

          // 2) Stop current song + play one of the AudioTracks
          if (this.audioLooper) {
            // Stop any current playback
            this.audioLooper.stop()

            // Prefer random if the helper exists
            if ((this.audioLooper as any).playRandomLoop) {
              ;(this.audioLooper as any).playRandomLoop()
            } else if ((this.audioLooper as any).playLoop) {
              // Fallback: first track if random isn’t available
              ;(this.audioLooper as any).playLoop(0)
            } else {
              print("ChatGPT: audioLooper has no play function.")
            }
          } else {
            print("ChatGPT: No AudioLooperTracks reference assigned.")
          }
        })
      },
      () => {
        print("Image encoding failed!")
      },
      this.ImageQuality,
      this.ImageEncoding
    )
  }

  async sendGPTChat(
    request: string,
    image64: string,
    callback: (response: string) => void
  ) {
    OpenAI.chatCompletions({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: request },
            {
              type: "image_url",
              image_url: { url: "data:image/jpeg;base64," + image64 },
            },
          ],
        },
      ],
      max_tokens: 100,
    })
      .then((response) => {
        if (response.choices && response.choices.length > 0) {
          const out = response.choices[0].message.content
          callback && callback(out)
          print("Response from OpenAI: " + out)
        } else {
          print("OpenAI returned no choices.")
        }
      })
      .catch((error) => {
        print("Error in OpenAI request: " + error)
      })
  }
}