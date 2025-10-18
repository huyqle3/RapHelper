import animate, { CancelSet } from "SpectaclesInteractionKit.lspkg/Utils/animate"
import WorldCameraFinderProvider
  from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider"

@component
export class CaptionBehavior extends BaseScriptComponent {
  @input captionText: Text
  @input scaleObj: SceneObject

  private trans: Transform
  private scaleTrans: Transform
  private startPos: vec3

  private scaleCancel: CancelSet = new CancelSet()

  private worldCamera: WorldCameraFinderProvider
  private camTrans: Transform = null

  onAwake() {
    this.trans = this.getSceneObject().getTransform()
    this.scaleTrans = this.scaleObj.getTransform()
    this.scaleTrans.setLocalScale(vec3.zero())

    // World camera via Provider (syntax aligned with your example)
    this.worldCamera = WorldCameraFinderProvider.getInstance()
    this.camTrans = this.worldCamera ? this.worldCamera.getTransform() : null
  }

  openCaption(text: string, pos: vec3, _rot: quat) {
    this.startPos = pos
    this.captionText.text = text

    // Position first
    this.trans.setWorldPosition(pos)

    // Face camera, lock roll so X stays horizontal
    if (this.camTrans) {
      const camPos = this.camTrans.getWorldPosition()
      const dir = camPos.sub(pos).normalize() // toward camera

      // Use world up; if nearly parallel, derive a safe up to avoid gimbal issues
      let up = vec3.up()
      if (Math.abs(up.dot(dir)) > 0.98) {
        // build an up perpendicular to dir using camera right
        up = this.camTrans.right.cross(dir).normalize()
        if (up.length < 1e-3) up = this.camTrans.up
      }

      const faceCamNoRoll = quat.lookAt(dir, up)
      this.trans.setWorldRotation(faceCamNoRoll)
    }

    // Consistent size
    this.trans.setWorldScale(vec3.one().uniformScale(0.5))

    // Pop-in animation
    if (this.scaleCancel) this.scaleCancel.cancel()
    animate({
      easing: "ease-out-elastic",
      duration: 1,
      update: (t: number) => {
        this.scaleTrans.setLocalScale(
          vec3.lerp(vec3.zero(), vec3.one().uniformScale(1.33), t)
        )
      },
      ended: null,
      cancelSet: this.scaleCancel,
    })
  }
}