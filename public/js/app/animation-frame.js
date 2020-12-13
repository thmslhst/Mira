// th0maslh0est
//-------------

if (!navigator.cancelAnimationFrame)
    navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
if (!navigator.requestAnimationFrame)
    navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

class AnimationFrame{
    // @param now : Date.now
    static update(now, callback){
        requestAnimationFrame(function update(){
            let delta = Date.now() - now;
            callback(delta);
            requestAnimationFrame(update);
        });
    }
}
