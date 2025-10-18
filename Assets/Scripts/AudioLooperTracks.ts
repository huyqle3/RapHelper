@component
export class AudioLooperTracks extends BaseScriptComponent {
  @input audioComp: AudioComponent
  @input audioTracks: AudioTrackAsset[]

  // --- NEW: ensure audio is enabled & ready
  private ensureEnabled() {
    if (!this.audioComp) return false
    // Make sure the component and its object are enabled
    this.audioComp.enabled = true
    const so = this.audioComp.getSceneObject && this.audioComp.getSceneObject()
    if (so) so.enabled = true
    // Some SDKs need a tiny defer so the engine applies enabled state
    return true
  }

  public playLoop(index: number) {
    if (!this.audioComp || !this.audioTracks || this.audioTracks.length === 0) {
      print("AudioLooperTracks: Missing AudioComponent or tracks.")
      return
    }
    if (index < 0 || index >= this.audioTracks.length) {
      print("AudioLooperTracks: Invalid index " + index)
      return
    }

    if (!this.ensureEnabled()) return

    this.audioComp.stop(false)

    const track = this.audioTracks[index]
    if ((this.audioComp as any).setAudioTrack) {
      ;(this.audioComp as any).setAudioTrack(track)
    } else {
      ;(this.audioComp as any).audioTrack = track
    }

    ;(this.audioComp as any).loop = true

    // Defer one frame to ensure the track assignment & enabled state stick
    const evt = this.createEvent("DelayedCallbackEvent")
    evt.bind(() => {
      this.audioComp.play(1.0)
      print("AudioLooperTracks: Looping track " + index)
    })
    evt.reset(0.0)
  }

  public stop() {
    if (!this.audioComp) return
    this.audioComp.stop(false)
  }
}