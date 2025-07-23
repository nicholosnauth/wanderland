package io.github.nicholosnauth.wanderland

import com.badlogic.gdx.Application
import com.badlogic.gdx.Gdx
import io.github.nicholosnauth.wanderland.screen.GameScreen
import ktx.app.KtxGame
import ktx.app.KtxScreen

/** [com.badlogic.gdx.ApplicationListener] implementation shared by all platforms. */
class Wanderland : KtxGame<KtxScreen>(){

    override fun create() {
        Gdx.app.logLevel = Application.LOG_DEBUG
        addScreen(GameScreen())
        setScreen<GameScreen>()
    }
}
