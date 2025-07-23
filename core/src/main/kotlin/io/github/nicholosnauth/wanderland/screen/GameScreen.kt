package io.github.nicholosnauth.wanderland.screen

import ktx.app.KtxScreen
import ktx.log.logger


class GameScreen : KtxScreen{

    override fun show() {
        log.debug{ "The GameScreen is shown!"}
    }


    companion object{
    private val log = logger<GameScreen>()
    }

}
