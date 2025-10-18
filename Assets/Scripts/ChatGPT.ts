import { OpenAI } from "RemoteServiceGateway.lspkg/HostedExternal/OpenAI";

@component
export class ChatGPT extends BaseScriptComponent {
  private ImageQuality = CompressionQuality.HighQuality;
  private ImageEncoding = EncodingType.Jpg;

  onAwake() {}

  makeImageRequest(imageTex: Texture, callback) {
    print("Making image request...");
    Base64.encodeTextureAsync(
      imageTex,
      (base64String) => {
        print("Image encode Success!");
        const textQuery =
          "Based on this photo, write an 4-bar rap battle-style diss about the subject in the photo. Keep it clean, funny, and clever — no profanity. Simple, easy to read on the spot, not too many syllables.";
        this.sendGPTChat(textQuery, base64String, callback);
      },
      () => {
        print("Image encoding failed!");
      },
      this.ImageQuality,
      this.ImageEncoding
    );
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
              image_url: {
                url: `data:image/jpeg;base64,` + image64,
              },
            },
          ],
        },
      ],
      max_tokens: 100,
    })
      .then((response) => {
        if (response.choices && response.choices.length > 0) {
          callback(response.choices[0].message.content);
          print("Response from OpenAI: " + response.choices[0].message.content);
        }
      })
      .catch((error) => {
        print("Error in OpenAI request: " + error);
      });
  }
}
