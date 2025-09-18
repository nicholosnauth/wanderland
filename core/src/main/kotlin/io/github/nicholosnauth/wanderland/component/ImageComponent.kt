package io.github.nicholosnauth.wanderland.component

import com.badlogic.gdx.scenes.scene2d.ui.Image


class ImageComponent : Comparable<ImageComponent>
{
    lateinit var image: Image

    override fun compareTo(other: ImageComponent): Int {
        val yDiff = other.image.y.compareTo(image.y)
        return if (yDiff != 0){
    yDiff
        }else{
            other.image.x.compareTo(image.x)
        }
    }
}
