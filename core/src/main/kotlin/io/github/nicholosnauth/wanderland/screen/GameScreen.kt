package io.github.nicholosnauth.wanderland.screen

// Importing LibGDX classes for graphics, sprites, UI, and actions
import com.artemis.ComponentTypeFactory
import com.badlogic.gdx.graphics.Texture   // Image/texture loaded into GPU memory
import com.badlogic.gdx.graphics.g2d.Sprite // Drawable object that uses a Texture
import com.badlogic.gdx.scenes.scene2d.Stage // A container that holds all "actors" (things on screen)
import com.badlogic.gdx.scenes.scene2d.actions.MoveByAction // Example of an action (animations)
import com.badlogic.gdx.scenes.scene2d.ui.Image // An actor that displays a texture
import com.badlogic.gdx.utils.Scaling // Handles scaling images to fit screen
import com.badlogic.gdx.utils.viewport.ExtendViewport // Viewport keeps world units consistent
// ECS (Entity Component System) library Fleks
import com.github.quillraven.fleks.ComponentListener
import com.github.quillraven.fleks.Entity
import com.github.quillraven.fleks.World
import com.github.quillraven.fleks.world
// Your custom game code
import io.github.nicholosnauth.wanderland.component.ImageComponent
import io.github.nicholosnauth.wanderland.system.RenderSystem
// Kotlin extensions for LibGDX
import ktx.actors.stage
import ktx.app.KtxScreen
import ktx.assets.disposeSafely
import ktx.log.logger
// Some extra imports that don’t look like they’re being used here
import java.awt.AWTEventMulticaster.add
import javax.swing.text.Position


// A "screen" in LibGDX represents one part of the game (menu, level, etc.)
// KtxScreen gives you helpful lifecycle methods like show, render, resize, dispose
class GameScreen : KtxScreen {

    // Stage = scene graph that holds "actors" (UI, images, sprites, etc.)
    // ExtendViewport keeps the aspect ratio (16:9 world units) no matter window size
    private val stage: Stage = Stage(ExtendViewport(16f, 9f))

    // Texture = raw image loaded into GPU (your player image)
    private val texture: Texture = Texture("wanderland/assets/graphics/player.png")

    // World = Fleks ECS (Entity Component System) container
    // It stores all entities + their components + the systems that update them
    private val world = world {
        injectables {


            // Injects stage so systems can use it
            (stage)
        }
        systems {
            // Add a RenderSystem (your custom system to draw things)
            add<RenderSystem>()
        }
        components {
                    }
    }


    // Called when this screen is first shown
    override fun show() {


        // Create a new Entity inside the ECS world
        // Entity = just an ID, it doesn’t store data itself
        val entity: Entity = world.entity {
            // Add components to the entity
            // Components = plain data (no logic)
            add<Position>() // This would track the entity’s position (X,Y)
            add<Sprite>()   // This gives it something drawable
        }
    }

    // Called when the window size changes
    override fun resize(width: Int, height: Int) {
        // Update the viewport so stage resizes and keeps aspect ratio
        stage.viewport.update(width, height, true)
    }

    // Called when screen is destroyed / switched out
    override fun dispose() {
        // Safely free memory for stage, texture, and ECS world
        stage.disposeSafely()
        texture.disposeSafely()
        world.dispose()
    }

    // Called every frame (delta = time since last frame)
    override fun render(delta: Float) {
        // Update ECS world -> systems run (like RenderSystem drawing entities)
        world.update(delta)
    }

    companion object {
        // A listener that reacts when an ImageComponent is added/removed from an entity
        class ImageComponentListener(
            private val stage: Stage
        ) : ComponentListener<ImageComponent> {

            // When an entity gets an ImageComponent, add its image to the stage
            override fun onComponentAdded(entity: Entity, component: ImageComponent) {
                stage.addActor(component.image)
            }

            // When an entity loses its ImageComponent, remove its image from the stage
            override fun onComponentRemoved(entity: Entity, component: ImageComponent) {
                stage.root.removeActor(component.image)
            }
        }
    }
}
