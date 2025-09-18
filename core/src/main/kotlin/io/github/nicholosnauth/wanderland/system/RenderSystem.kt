package io.github.nicholosnauth.wanderland.system


import com.badlogic.gdx.scenes.scene2d.Stage
import com.github.quillraven.fleks.AllOf
import com.github.quillraven.fleks.ComponentMapper
import com.github.quillraven.fleks.Entity
import com.github.quillraven.fleks.IteratingSystem
import com.github.quillraven.fleks.collection.compareEntity
import io.github.nicholosnauth.wanderland.component.ImageComponent

@AllOf([ImageComponent::class])

/*This class is the render classed that is called to display the graphics and
objects on the game screen

* */
class RenderSystem(

    private val stage: Stage,
    private val imageCmps: ComponentMapper<ImageComponent>
) : IteratingSystem(
    comparator = compareEntity { e1, e2 ->  imageCmps[e1].compareTo(imageCmps[e2])}
) {
    override fun onTick() {
        super.onTick()
        with(stage){
            act(deltaTime)
            draw()
        }
    }
    override fun onTickEntity(entity: Entity) {
        imageCmps[entity].image.toFront()
    }
}
