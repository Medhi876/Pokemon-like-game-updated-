class Sprite {
    constructor({ 
    position,
    image,
    frames = {max: 1, hold: 10 },
    sprites,
    animate = false,
    rotation = 0,

    }) {
        this.position = position
        this.image = image
        this.frames = {...frames, value:0, elapsed: 0 }
        
        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height 
        }
        this.animate = animate
        this.sprites = sprites
        this.opacity = 1
        this.rotation = rotation
        
    }
    
    draw() { //draw plains de truc
        c.save()
        c.translate(
        this.position.x + this.width / 2,
        this.position.y + this.height / 2
        )
        c.rotate(this.rotation)
        c.translate(
            -this.position.x - this.width / 2,
            -this.position.y - this.height / 2
            )
        c.globalAlpha = this.opacity
        c.drawImage( 
            this.image, 
            this.frames.value * this.width,
            0,
            this.image.width / this.frames.max,
            this.image.height,
            this.position.x,
            this.position.y,                    
            this.image.width / this.frames.max, //player image avec frame divisé
            this.image.height
        )
        c.restore()

        if (!this.animate) return
        
        if (this.frames.max > 1) {
            this.frames.elapsed++
        }

        if (this.frames.elapsed % this.frames.hold === 0)
            {if (this.frames.value < this.frames.max - 1)
                this.frames.value++
            else this.frames.value = 0
        }
    }
}

class Monster extends Sprite {
    constructor({
        position,
        image,
        frames = {max: 1, hold: 10 },
        sprites,
        animate = false,
        rotation = 0,
        isEnemy = false,
        name,
        attacks
    }) {
        super({
            position,
            image,
            frames,
            sprites,
            animate,
            rotation,
        })
        this.health = 100
        this.isEnemy = isEnemy
        this.name = name
        this.attacks = attacks
    }
    
    faint() {
        document.querySelector('#dialogueBox').innerHTML = this.name + ' est mouru !'
        gsap.to(this.position, {
            y: this.position.y + 20
        })
        gsap.to(this, {
            opacity: 0
        })
    }
    
    attack({ attack, recipient, renderedSprites}) {
        document.querySelector('#dialogueBox').style.display = 'block' 
        document.querySelector('#dialogueBox').innerHTML = this.name + ' used ' + attack.name
        
        let healthBar = '#enemyHpBarFull'
        if (this.isEnemy) healthBar = '#allyHpBarfull'

        let rotation = 1
        if (this.isEnemy) rotation = -2.2
        recipient.health -= attack.dammage

        switch (attack.name) {
            case 'Fireball':
                const fireballImage = new Image()
                fireballImage.src = '../img/fireball.png'
                const fireball = new Sprite({
                    position: {
                        x: this.position.x,
                        y: this.position.y
                    },
                    image: fireballImage,
                    frames: {
                        max: 4,
                        hold: 10
                    },
                    animate: true,
                    rotation
                })

                renderedSprites.splice(1, 0, fireball)
                
                gsap.to(fireball.position, {
                    x: recipient.position.x,
                    y: recipient.position.y,
                    onComplete: () => {
                    //enemie getting hit
                    gsap.to('healthBar', {
                        width: recipient.health - attack.dammage + '%'
                        })
                        gsap.to(recipient.position, {
                        x: recipient.position.x + 10,
                        yoyo : true,
                        repeat: 5,
                        duration: 0.08
                        })
                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 5,
                            yoyo : true,
                            duration: 0.08
                        })
                    renderedSprites.splice(1, 1)
                    }
                }), console.log()
            break;
            case 'Tackle':
                const tl = gsap.timeline()

                let movementDistance = 20
                if(this.isEnemy) movementDistance = - 20

                tl.to(this.position, {
                x: this.position.x - movementDistance
                })
                .to(this.position, {
                    x: this.position.x + movementDistance * 2,
                    duration: 0.1,
                    onComplete: () => {                           //enemie hit animation
                        //enemie getting hit
                        gsap.to(healthBar, {
                        width: recipient.health - attack.dammage + '%'
                        })
                        gsap.to(recipient.position, {
                        x: recipient.position.x + 10,
                        yoyo : true,
                        repeat: 5,
                        duration: 0.08
                        })
                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 5,
                            yoyo : true,
                            duration: 0.08
                        })
                    }                                        //enemie hit animation
                }).to(this.position, {
                    x: this.position.x
                })
            break;
        }
    }
}

class Boundary { // construit les bondary : batle zone et collision zone
    static width = 48
    static height = 48
    constructor({ position }) {
        this.position = position
        this.width = 48
        this.height = 48
    }

    draw() { // "dessine" les bordure de zone
        c.fillStyle = 'rgba(255, 0, 0, 0.2'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}