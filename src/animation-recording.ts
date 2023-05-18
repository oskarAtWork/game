
export function animationRecording() {
    const mt = document.getElementById('mouse-tracker') as HTMLCanvasElement;
    let coors: [number, number][] = [];
    const ctx = mt.getContext('2d');

    mt?.addEventListener('mousedown', (ev) => {
        if (!ev.shiftKey) {
            return;
        }

        ctx?.clearRect(0, 0, 100, 100);
        while(coors.length) coors.pop();
    })


    mt?.addEventListener('mousemove', (ev) => {
        if (!ev.shiftKey) {
            return;
        }

        const rect = mt.getBoundingClientRect();
        const x = Math.round(ev.x - rect.left);
        const y = Math.round(ev.y - rect.top);

        const last = coors[coors.length - 1];


        if (last?.[0] !== x || last?.[1] !== y) {
            coors.push([x, y]);
            ctx?.fillRect(x, y, 2, 2);
        }
    })

    mt?.addEventListener('mouseup', () => {
        const first = coors[0];

        if (!first) {
            return;
        }

        const output = coors.map(([x, y]) => [x-first[0], y-first[1]])
        
        document.getElementById('result')!!.innerHTML = JSON.stringify(output);
    })
}