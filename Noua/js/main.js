const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const sphere = new THREE.SphereBufferGeometry(0.75,30,10);
const red = new THREE.MeshPhongMaterial( { color: 0xff00ff } );

const geometry = new THREE.BoxGeometry(20,0.5,20);
const material = new THREE.MeshPhongMaterial( { color: 0xdddddd} )
const floor = new THREE.Mesh( geometry, material );
floor.position.y -= 1;
scene.add(floor);

let counter = 0;

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.125 );

directionalLight.position.x = Math.random() - 0.5;
directionalLight.position.y = Math.random() - 0.5;
directionalLight.position.z = Math.random() - 0.5;
directionalLight.position.normalize();

scene.add( directionalLight );
const pointLight = new THREE.PointLight( 0xffffff, 1 );
pointLight.position.y = 10; 
scene.add( pointLight );
scene.add( new THREE.AmbientLight( 0x111111 ) );
                
class House{
    
    constructor(pos,mesh){
        this.id = counter++;
        this.pos = pos;
        this.mesh = mesh;
        this.setPosition(pos);
    }
    setPosition(pos){
        this.mesh.position.x = pos.x;
        this.mesh.position.y = pos.y;
        this.mesh.position.z = pos.z;
    }

    bind(scene){
        scene.add(this.mesh);
    }

    unbind(scene){
        scene.remove(this.mesh);   
    }
}

class Action{
    constructor(action,condition,type){
        this.action = action;
        this.condition = condition;
        this.type =type;
    }

    isDone(){
        
        if(this.condition()){
            
            this.action();
            return false;
        }
        //a terminat
        return true;
    }

}

class Player{
    
    constructor(pos,mesh,home){
        this.id = counter++;
        this.home = home;
        this.pos = pos;
        this.mesh = mesh;
        this.setPosition(pos);
        this.speed = Math.random()*0.05 + 0.10;
        this.actions = [];
        this.task = 0;
        
    }

    setPosition(pos){
        this.pos = pos;
        this.mesh.position.x = pos.x;
        this.mesh.position.y = pos.y;
        this.mesh.position.z = pos.z;
    }

    update(){
        
        if(this.actions.length > 0 && this.actions[0].isDone()){
            
            
            if(this.actions[0].type === "move"){
                this.task++;
                this.task %=2;    
                if(this.task == 1)
                    this.actions.push(moveTo(this,this.home.pos));
                else
                    this.actions.push(moveTo(this,{x:0,y:0,z:0}));

            }
            this.actions.shift()
        }
            
    }

    bind(scene){
        scene.add(this.mesh);
    }

    unbind(scene){
        scene.remove(this.mesh);   
    }
}

const houses = [];
const players = [];
const rand = ()=>parseInt(Math.random()*255);
const colided = (p1,p2,min) =>{return Math.sqrt(Math.pow(p2.x-p1.x,2) + Math.pow(p2.y-p1.y,2) + Math.pow(p2.z-p1.z,2)) < min};
const moveTo = (player,target) => new Action(()=>{
    const pos = player.mesh.position;
    const angle = Math.atan2(target.z - pos.z,target.x - pos.x)
    const nX = Math.cos(angle) * player.speed;
    const nZ = Math.sin(angle) * player.speed;
    pos.x += nX;
    pos.z += nZ;
    player.setPosition(pos);
},()=>{
    //sa continue return true
    if(!colided(player.pos,target,1))
        return true;
    
    //a terminat return false
    return false;
},"move")

function placeHouses(center,distance,number){

    const aIncrement = (2 * Math.PI) / number; 
    for(let i = 0; i < number; i++){
        const x = Math.cos(aIncrement * i) * distance;
        const y = 0;
        const z = Math.sin(aIncrement * i) * distance;

        const g = new THREE.BoxGeometry(1,parseInt(Math.random()*3+1),1)
        const m = new THREE.MeshPhongMaterial( { color: new THREE.Color(`rgb(${rand()},${rand()},${rand()})`) } );
        const h = new House({x:center['x']+x,y:center['y']+y,z:center['z']+z},new THREE.Mesh( g, m));

        
        const p = new Player({x:center['x']+x,y:center['y']+y,z:center['z']+z},
                                new THREE.Mesh(sphere,m),
                                h);
        p.bind(scene);
        p.actions.push(moveTo(p,{x:0,y:0,z:0}))
        h.bind(scene);
        houses.push(h);
        players.push(p);
    }
}


placeHouses({x:0,y:0,z:0},8,10);


camera.position.z = 10;
camera.position.y = 5;
camera.rotation.x -= Math.PI/4;



function animate() {
    players.map(p => p.update())
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();