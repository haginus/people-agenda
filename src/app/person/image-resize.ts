import { Observable } from 'rxjs';

export const imageResize: (file : File) => Observable<string> = (file : File) =>  {
    return new Observable(observer => {
        let img = document.createElement("img");
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            img.src = e.target.result as string;
            img.onload = () => {
                let canvas = document.createElement("canvas");
                const MAX_WIDTH = 400;
                const MAX_HEIGHT = 400;
                let width = img.width;
                let height = img.height;

                const ratio = width / height;

                width = MAX_WIDTH;
                height = width / ratio;

                if(height < MAX_HEIGHT) {
                    height = MAX_HEIGHT;
                    width = ratio * height
                }
                
                let posX = 0
                let posY = 0;

                if(width > MAX_WIDTH)
                    posX = (MAX_WIDTH - width) / 2
                if(height > MAX_HEIGHT)
                    posY = (MAX_HEIGHT - height) / 2
                
                canvas.width = MAX_WIDTH;
                canvas.height = MAX_HEIGHT;
                let ctx = canvas.getContext("2d");
                ctx.drawImage(img, posX, posY, width, height);

                let dataurl = canvas.toDataURL("image/jpeg");
                observer.next(dataurl);
                observer.complete();
            }    
        }
    });
}