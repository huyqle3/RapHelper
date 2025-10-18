// AudioLooperTracks.ts
// Drag in an AudioComponent and a list of AudioTrack assets.
// Call playLoop(index) to loop one track.

@component
export class AudioLooperTracks extends BaseScriptComponent {
  // An AudioComponent in your scene (on this object or another).
  @input audioComp: AudioComponent

  // Drop your AudioTrack assets here in the Inspector.
  // In Lens Studio/Spectacles, AudioTrack assets are typed as Asset.AudioTrack
  @input audioTracks: AudioTrackAsset[]

  onAwake() {
    if (!this.audioComp) {
      print("AudioLooperTracks: Please assign an AudioComponent.")
    }
    if (!this.audioTracks || this.audioTracks.length === 0) {
      print("AudioLooperTracks: Add at least one AudioTrack asset.")
    }
  }

  // Public: play the given track index on loop
  public playLoop(index: number) {
    if (!this.audioComp || !this.audioTracks || this.audioTracks.length === 0) {
      print("AudioLooperTracks: Missing AudioComponent or tracks.")
      return
    }
    if (index < 0 || index >= this.audioTracks.length) {
      print("AudioLooperTracks: Invalid index " + index)
      return
    }

    // Stop anything currently playing
    this.audioComp.stop(false)

    // Assign the track (handle either method or property depending on SDK)
    const track = this.audioTracks[index]
    // Some SDKs expose setAudioTrack(...), others expose audioTrack property
    if ((this.audioComp as any).setAudioTrack) {
      ;(this.audioComp as any).setAudioTrack(track)
    } else {
      ;(this.audioComp as any).audioTrack = track
    }

    // Loop and play
    ;(this.audioComp as any).loop = true
    this.audioComp.play(1.0) // optional volume multiplier
    print("AudioLooperTracks: Looping track " + index)
  }

  // Optional helpers:
  public stop() {
    if (!this.audioComp) return
    this.audioComp.stop(false)
  }

  public playOnce(index: number) {
    if (!this.audioComp || !this.audioTracks || this.audioTracks.length === 0) return
    if (index < 0 || index >= this.audioTracks.length) return

    this.audioComp.stop(false)
    const track = this.audioTracks[index]
    if ((this.audioComp as any).setAudioTrack) {
      ;(this.audioComp as any).setAudioTrack(track)
    } else {
      ;(this.audioComp as any).audioTrack = track
    }
    ;(this.audioComp as any).loop = false
    this.audioComp.play(1.0)
  }

  public getTrackCount(): number {
    return this.audioTracks ? this.audioTracks.length : 0
  }
  
  public playRandomLoop(): void {
    if (!this.audioComp || !this.audioTracks || this.audioTracks.length === 0) {
      print("AudioLooperTracks: No tracks to play.")
      return
    }
    const idx = Math.floor(Math.random() * this.audioTracks.length)
    this.playLoop(idx)
  }
}