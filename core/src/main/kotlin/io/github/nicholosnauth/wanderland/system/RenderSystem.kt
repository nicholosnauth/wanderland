package io.github.nicholosnauth.wanderland.system

@
import com.github.quillraven.fleks.Entity
import com.github.quillraven.fleks.IteratingSystem
import io.github.nicholosnauth.wanderland.component.ImageComponent
import com.github.quillraven.fleks.*


@AllOf(components = [ImageComponent::class])
class RenderSystem : IteratingSystem() {
    override fun onTickEntity(entity: Entity) {

    }

}
