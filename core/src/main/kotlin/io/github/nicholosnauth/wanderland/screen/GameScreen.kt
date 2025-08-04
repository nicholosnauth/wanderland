package io.github.nicholosnauth.wanderland.screen

import com.badlogic.gdx.graphics.Texture
import com.badlogic.gdx.graphics.g2d.Batch
import com.badlogic.gdx.graphics.g2d.SpriteBatch
import com.badlogic.gdx.physics.box2d.World
import com.badlogic.gdx.scenes.scene2d.Stage
import com.badlogic.gdx.scenes.scene2d.ui.Image
import com.badlogic.gdx.utils.Scaling
import com.badlogic.gdx.utils.viewport.ExtendViewport
import ktx.app.KtxScreen
import ktx.assets.disposeSafely
import ktx.graphics.use
import ktx.log.logger


//
class GameScreen : KtxScreen{
    private val stage : Stage = Stage (ExtendViewport(16f,9f))
    private val texture : Texture = Texture("wanderland/assets/graphics/player.png")
    private val world : World

    }

    //Function displays what is shown on the window to the playerb including the character,
    override fun show() {
        log.debug{ "The GameScreen is shown!"}//test message to see if the function is displaying the  window
        stage.addActor(
            Image(texture).apply {
                setPosition(1f,1f)
                setSize(1f, 1f)
                setScaling(Scaling.fill)
            }

        )
    }

    override fun resize(width: Int, height: Int) {
        stage.viewport.update(width, height, true)
    }

    override fun dispose() {
        stage.disposeSafely()
        texture.disposeSafely()
    }
    override fun render(delta: Float) {
               with(stage){
                  act( delta)
                   draw()
               }


    }

    companion object{
    private val log = logger<GameScreen>()
    }

}
