const canvas = document.querySelector('canvas') //selectionne la balise canva en html, constente
const c = canvas.getContext('2d') //precise que le canvas sera 2d, constente
canvas.width = 1024 //largeur du canvas
canvas.height = 576 //heuteur du canvas
const collisionsMap = [] //pour les collision
for (let i = 0; i < collisions.length; i += 70) { //width de la map en nombre de tile
    collisionsMap.push(collisions.slice(i, 70 + i))
}
const battleZonesMap = [] //pour les battle
for (let i = 0; i < battleZonesData.length; i += 70) { //width de la map en nombre de tile
    battleZonesMap.push(battleZonesData.slice(i, 70 + i))
}
const boundaries = []; //bondarrie array pour JStile de collision
const offset = { 
    x: -160,
    y: -355
}
collisionsMap.forEach((row, i) => { //pour les collision
    row.forEach((symbol, j) => {
        if (symbol === 2049)
        boundaries.push(
            new Boundary({
                position: {
                x: j * Boundary.width + offset.x,
                y: i * Boundary.height + offset.y
                }
            })
        )
    })
})
const battleZones = []  //battle zones array for JStile
battleZonesMap.forEach((row, i) => { //pour les collision
    row.forEach((symbol, j) => {
        if (symbol === 2049)
        battleZones.push(
            new Boundary({
                position: {
                x: j * Boundary.width + offset.x,
                y: i * Boundary.height + offset.y
                }
            })
        )
    })
})
//console.log(battleZones)

const image = new Image() //constante "image" pour la map
image.src = './img/Pokemon Style Game Map2.png'  //source de la "new image" de type map
image.src = '../img/Pokemon Style Game Map2.png'  //source de la "new image" de type map

const foregroundImage = new Image() //constente "image" pour la map
foregroundImage.src = './img/Pokemon Style Game Map foreground object.png'  //source de la "new image" de type map
foregroundImage.src = '../img/Pokemon Style Game Map foreground object.png'  //source de la "new image" de type foreground of the map

const playerDownImage = new Image () //constante "playerImage" pour le personnage
playerDownImage.src = './img/playerDown.png' //source du sprite Down du personnage
playerDownImage.src = '../img/playerDown.png' //source du sprite Down du personnage

const playerUpImage = new Image () //constante "playerUpImage" pour le personnage
playerUpImage.src = './img/playerUp.png' //source du sprite Up du personnage
playerUpImage.src = '../img/playerUp.png' //source du sprite Up du personnage

const playerLeftImage = new Image () //constante "playerUpImage" pour le personnage
playerLeftImage.src = './img/playerLeft.png' //source du sprite Left du personnage
playerLeftImage.src = '../img/playerLeft.png' //source du sprite Left du personnage

const playerRightImage = new Image () //constante "playerRightImage" pour le personnage
playerRightImage.src = './img/playerRight.png' //source du sprite Right du personnage
playerRightImage.src = '../img/playerRight.png' //source du sprite Right du personnage


const player = new Sprite ({
    position: {
        x: canvas.width / 2 - 192 / 4 / 2, //divise le sprite du player par 4 pour pas avoir le sprite entier
        y: canvas.height / 2 - 68 / 2
    },
    image: playerDownImage,
    frames: {
        max: 4, //pour l'annimation du mouvement
        hold: 10
    },
    sprites: {
        up: playerUpImage,  //sprite up
        left: playerLeftImage,  //sprite left
        right: playerRightImage,  //sprite right
        down: playerDownImage  //sprite down
    }
})
const background = new Sprite({ //spawn point du background
    position: { 
        x: offset.x,
        y: offset.y
    }, 
    image: image
});
const foreground = new Sprite({ //spawn point du foreground
    position: { 
        x: offset.x,
        y: offset.y
    }, 
    image: foregroundImage
});
const keys = { //definit les keye comme unpressed par defalt
    z: {
        pressed: false
    },
    q: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}
const movables = [background, ...boundaries, foreground, ...battleZones] //pour le mouvement du joueur :p
function rectangularCollision({ rectangle1, rectangle2 }) {
    return (
        rectangle1.position.x + rectangle1.width >= rectangle2.position.x && 
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
        rectangle1.position.y + player.height >= rectangle2.position.y
    )
}
const battle = {
    initiated: false
}
function animate() {
    const animationId = window.requestAnimationFrame(animate)//appele de animate pour loop
    console.log(animationId)
    background.draw()//draw le background
    boundaries.forEach(boundary => { 
        boundary.draw() //draw les Boundary
    })
    battleZones.forEach(BattleZone => { 
        BattleZone.draw() //draw les Boundary
    })
    player.draw() //draw le player
    foreground.draw() //draw le foreground
    let moving = true
    player.animate = false
    
    
    if(battle.initiated) return
    
    if (keys.z.pressed || keys.s.pressed || keys.q.pressed || keys.d.pressed) {
        for (let i = 0; i < battleZones.length; i++) {
            const battleZone = battleZones[i]
            const overlappingArea = 
            (Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width) - 
            Math.max(player.position.x, battleZone.position.x))
            * 
            (Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height) - 
            Math.max(player.position.y, battleZone.position.y))
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: battleZone
                }) &&
                overlappingArea > (player.width * player.height) / 2
                && Math.random() < 0.01
            ) {
                console.log('activate battle')
                
                //desactivate curent animation loop
                window.cancelAnimationFrame(animationId)
                
                battle.initiated = true
                gsap.to('#overlappingDiv', {
                    opacity: 1, 
                    repeat: 3,
                    yoyo: true,
                    duration: 0.4,
                    onComplete() {
                        gsap.to('#overlappingDiv', {
                            opacity: 1,
                            duration: 0.4,
                            onComplete() {
                                //activate new animation loop
                                animateBattle()
                                gsap.to('#overlappingDiv', {
                                    opacity: 0,
                                    duration: 0.4,
                                })
                            }
                        })
                        
                    }
                })
                break
            }
        }
    }
    
    if (keys.z.pressed && lastKey === 'z') { //mouvement si z.keye up
        player.animate = true
        player.image = player.sprites.up
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                    ...boundary, position: {
                        x: boundary.position.x,
                        y: boundary.position.y + 3
                    }
                }
                })
            ) {
            moving = false //mouvement false si collision detecté
                break
            }
        }
        
        if (moving)
        movables.forEach(movable => {
            movable.position.y += 3
        })
    }
    else if(keys.s.pressed && lastKey === 's') { //mouvement si s.keye down
    player.animate = true
    player.image = player.sprites.down
    for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i]
        if (
            rectangularCollision({
                rectangle1: player,
                rectangle2: {
                ...boundary, position: {
                    x: boundary.position.x,
                    y: boundary.position.y - 3
                }
            }
            })
        ) {
            console.log('colliding') //mouvement false si collision detecté
        moving = false
            break
        }
    }
        if (moving)
        movables.forEach(movable => {
            movable.position.y -= 3
        })
    }
    else if(keys.q.pressed && lastKey === 'q') { //mouvement si q.keye left
    player.animate = true
    player.image = player.sprites.left
    for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i]
        if (
            rectangularCollision({
                rectangle1: player,
                rectangle2: {
                ...boundary, position: {
                    x: boundary.position.x + 3,
                    y: boundary.position.y
                }
            }
            })
        ) {
            console.log('colliding') //mouvement false si collision detecté
        moving = false
            break
        }
    }
        if (moving)
        movables.forEach(movable => {
            movable.position.x += 3
        })
    }
    else if(keys.d.pressed && lastKey === 'd') {  //mouvement si d.keye right
    player.animate = true
    player.image = player.sprites.right
    for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i]
        if (
            rectangularCollision({
                rectangle1: player,
                rectangle2: {
                ...boundary, position: {
                    x: boundary.position.x  - 3,
                    y: boundary.position.y
                }
            }
            })
        ) {
            moving = false //mouvement false si collision detecté
            break
            }
        }
        
        if (moving)
        movables.forEach(movable => {
            movable.position.x -= 3
        })
    }
}
//animate() //appele en loop d'une function pour l'animation