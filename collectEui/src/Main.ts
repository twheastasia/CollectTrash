//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
class MyPanel extends eui.Panel{
        
}



class Main extends eui.UILayer {
    /**
     * 加载进度界面
     * loading process interface
     */
    private loadingView: LoadingUI;
    protected createChildren(): void {
        super.createChildren();
        //inject the custom material parser
        //注入自定义的素材解析器
        var assetAdapter = new AssetAdapter();
        this.stage.registerImplementation("eui.IAssetAdapter",assetAdapter);
        this.stage.registerImplementation("eui.IThemeAdapter",new ThemeAdapter());
        //Config loading process interface
        //设置加载进度界面
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        // initialize the Resource loading library
        //初始化Resource资源加载库
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }
    /**
     * 配置文件加载完成,开始预加载皮肤主题资源和preload资源组。
     * Loading of configuration file is complete, start to pre-load the theme configuration file and the preload resource group
     */
    private onConfigComplete(event:RES.ResourceEvent):void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        // load skin theme configuration file, you can manually modify the file. And replace the default skin.
        //加载皮肤主题配置文件,可以手动修改这个文件。替换默认皮肤。
        var theme = new eui.Theme("resource/default.thm.json", this.stage);
        theme.addEventListener(eui.UIEvent.COMPLETE, this.onThemeLoadComplete, this);

        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    }
    private isThemeLoadEnd: boolean = false;
    /**
     * 主题文件加载完成,开始预加载
     * Loading of theme configuration file is complete, start to pre-load the 
     */
    private onThemeLoadComplete(): void {
        this.isThemeLoadEnd = true;
        this.createScene();
    }
    private isResourceLoadEnd: boolean = false;
    /**
     * preload资源组加载完成
     * preload resource group is loaded
     */
    private onResourceLoadComplete(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.isResourceLoadEnd = true;
            this.createScene();
        }
    }
    private createScene(){
        if(this.isThemeLoadEnd && this.isResourceLoadEnd){
            this.createGameScene();
        }
    }
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onItemLoadError(event:RES.ResourceEvent):void {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    }
    /**
     * 资源组加载出错
     * Resource group loading failed
     */
    private onResourceLoadError(event:RES.ResourceEvent):void {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //ignore loading failed projects
        this.onResourceLoadComplete(event);
    }
    /**
     * preload资源组加载进度
     * loading process of preload resource
     */
    private onResourceProgress(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }
    /**
     * 创建场景界面
     * Create scene interface
     */
    private myCollection:eui.ArrayCollection = new eui.ArrayCollection();
    private rightNumber = 0;
    private wrongNumber = 0;
    private oushuGarbage:eui.Image;
    private qishuGarbage:eui.Image;
    private result1:egret.TextField;
    private result2:egret.TextField;
    private sourceArr:any[] = [];
    private count = 10;
    private trashCount = 10;
    private wholeSP:eui.UILayer;
    private spArray:any[] = [];
    private oushuBounds;
    private qishuBounds;
    private currentClickedImageIndex = 0;

    private createGameScene():void {
        var sky:egret.Bitmap = this.createBitmapByName("bg_png");
        this.addChild(sky);

        var resetBtn:eui.Button = new eui.Button;
        resetBtn.label = "重新开始";
        resetBtn.right = 0;
        resetBtn.top = 0;
        resetBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.restartGame, this);

        // var wholeSP:egret.Sprite = new egret.Sprite;
        this.wholeSP = new eui.UILayer;
        this.wholeSP.width = this.stage.stageWidth;
        this.wholeSP.height = this.stage.stageHeight;
        this.wholeSP.addChild(resetBtn);
        this.result1 = new egret.TextField;
        this.setText(this.result1, "答对： "+ this.rightNumber);
        this.wholeSP.addChild(this.result1);
        this.result2 = new egret.TextField;
        this.setText(this.result2, "答错： "+ this.wrongNumber);
        this.result2.y = 30;
        this.wholeSP.addChild(this.result2);
    
        this.oushuGarbage = new eui.Image;
        this.oushuGarbage.texture = RES.getRes("oushu_png");
        this.oushuGarbage.x = (this.wholeSP.width/2 - this.oushuGarbage.width)/2;
        this.oushuGarbage.y = (this.wholeSP.height - this.oushuGarbage.height);
        this.wholeSP.addChild(this.oushuGarbage);
        this.oushuBounds = this.oushuGarbage.getBounds();
        this.oushuBounds.x = this.oushuGarbage.x;
        this.oushuBounds.y = this.oushuGarbage.y;
        this.qishuGarbage = new eui.Image;
        this.qishuGarbage.texture = RES.getRes("qishu_png");
        this.qishuGarbage.x = this.wholeSP.width/2 + (this.wholeSP.width/2 - this.qishuGarbage.width)/2;
        this.qishuGarbage.y = (this.wholeSP.height - this.qishuGarbage.height);
        this.wholeSP.addChild(this.qishuGarbage);
        this.qishuBounds = this.qishuGarbage.getBounds();
        this.qishuBounds.x = this.qishuGarbage.x;
        this.qishuBounds.y = this.qishuGarbage.y;
        
        this.addTrashes();
    
        this.addChild(this.wholeSP);

        //根据name关键字，异步获取一个json配置文件，name属性请参考resources/resource.json配置文件的内容。
        // Get asynchronously a json configuration file according to name keyword. As for the property of name please refer to the configuration file of resources/resource.json.
        // RES.getResAsync("description", this.startAnimation, this);
    }

    private removeOtherImageMoveListeners() {
        for(var i:number = 0; i < this.spArray.length; i++){
            if(i != this.currentClickedImageIndex){
                this.spArray[i].removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.onTrashMoveHandler, this);
            }
        }
    }


    private addOtherImageMoveListeners(){
        for(var i:number = 0; i < this.spArray.length; i++){
            this.spArray[i].addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onTrashMoveHandler, this);
        }
    }

    private isTaped:Boolean = false;
    private onTrashTapBegin(event:egret.TouchEvent){
        this.currentClickedImageIndex = this.spArray.indexOf(event.currentTarget);
        this.wholeSP.removeChild(event.currentTarget);
        this.wholeSP.addChild(event.currentTarget);
        this.removeOtherImageMoveListeners();
        this.isTaped = true;
    }


    private onTrashMoveHandler(event:egret.TouchEvent){
        // console.log("in method");
        var touch = event.type;
        var target = event.currentTarget;
        if(this.isTaped == true ){
            // console.log("on move");
            target.x = event.stageX -20;
            target.y = event.stageY -20;
        }
    }

    private onTrashMoveEnd(event:egret.TouchEvent){
        this.isTaped = false;

        var hit = event.currentTarget.getBounds();
        hit.x = event.currentTarget.x;
        hit.y = event.currentTarget.y;
        if(hit.intersects(this.oushuBounds)){
            if(event.currentTarget.$children[1].text % 2){
                this.wrongNumber++;
                this.setText(this.result2, "答错： "+ this.wrongNumber);
            }else{
                this.rightNumber++;
                this.setText(this.result1, "答对： "+ this.rightNumber);
            }
            event.currentTarget.parent.removeChild(event.currentTarget);
            this.count--;
        }else if(hit.intersects(this.qishuBounds)){
            if(event.currentTarget.$children[1].text % 2){
                this.rightNumber++;
                this.setText(this.result1, "答对： "+ this.rightNumber);
            }else{
                this.wrongNumber++;
                this.setText(this.result2, "答错： "+ this.wrongNumber);
            }
            event.currentTarget.parent.removeChild(event.currentTarget);
            this.count--;
        }
        this.addOtherImageMoveListeners();
        console.log(this.count);
        if(this.count<=0) {
            this.showResultPanel();
        }
    }

    private setText(tf:egret.TextField, text:string){
        tf.text = text;
    }

    private onButtonClick(e: egret.TouchEvent) {
        var panel = new eui.Panel();
        panel.title = "Title";
        panel.horizontalCenter = 0;
        panel.verticalCenter = 0;
        this.addChild(panel);
    }
    
  

    private showResultPanel() {
        var panel:eui.Panel = new eui.Panel();
        if(this.rightNumber > this.trashCount * 0.6){
            panel.title = "恭喜你！过关了！";
        }else{
            panel.title = "请再接再励！";
        }
        panel.horizontalCenter = 0;
        panel.verticalCenter = 0;
        this.addChild(panel);
    }


    private restartGame(){
        console.log("restart game");
        this.resetStatus();
        this.addTrashes();
    }

    private addTrashes(){
        this.spArray.length = 0;
        for (var i:number = 0; i < this.trashCount; i++) {
            this.spArray[i] = new egret.Sprite;
            var tempImage:eui.Image = new eui.Image;
            tempImage.texture = Math.floor(Math.random()*2) ? RES.getRes("apple_png") : RES.getRes("banana_png");
            this.spArray[i].x = Math.floor(Math.random() * this.stage.stageWidth /1.2);
            this.spArray[i].y = Math.floor(Math.random() * this.stage.stageHeight /1.2);
            this.spArray[i].addChild(tempImage);
            var tf:egret.TextField = new egret.TextField;
            tf.text = Math.floor(Math.random() * 100) + "";
            tf.x = tempImage.x + 20;
            tf.y = tempImage.y + 30;
            tf.textColor = 0x1000ff;
            
            this.spArray[i].addChild(tf);
            this.spArray[i].addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTrashTapBegin, this);
            this.spArray[i].addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onTrashMoveHandler, this);
            this.spArray[i].addEventListener(egret.TouchEvent.TOUCH_END, this.onTrashMoveEnd, this);
            this.wholeSP.addChild( this.spArray[i]);
            this.sourceArr.push( this.spArray[i]);
            
        }
    }

    private resetStatus(){
        for(var i:number = 0; i < this.spArray.length; i++){
            if(this.spArray[i].parent) this.spArray[i].parent.removeChild(this.spArray[i]);
            this.spArray[i].removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTrashTapBegin, this);
            this.spArray[i].removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.onTrashMoveHandler, this);
            this.spArray[i].removeEventListener(egret.TouchEvent.TOUCH_END, this.onTrashMoveEnd, this);
        }
        this.count = this.trashCount;
        this.isTaped = false;
        this.wrongNumber = 0;
        this.rightNumber = 0;
        this.setText(this.result1, "答对： "+ this.rightNumber);
        this.setText(this.result2, "答错： "+ this.wrongNumber);
    }

    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    private createBitmapByName(name:string):egret.Bitmap {
        var result = new egret.Bitmap();
        var texture:egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

    /**
     * 描述文件加载成功，开始播放动画
     * Description file loading is successful, start to play the animation
     */
    private startAnimation(result:Array<any>):void {
        var self:any = this;

        var parser = new egret.HtmlTextParser();
        var textflowArr:Array<Array<egret.ITextElement>> = [];
        for (var i:number = 0; i < result.length; i++) {
            textflowArr.push(parser.parser(result[i]));
        }

        var textfield = self.textfield;
        var count = -1;
        var change:Function = function () {
            count++;
            if (count >= textflowArr.length) {
                count = 0;
            }
            var lineArr = textflowArr[count];

            self.changeDescription(textfield, lineArr);

            var tw = egret.Tween.get(textfield);
            tw.to({"alpha": 1}, 200);
            tw.wait(2000);
            tw.to({"alpha": 0}, 200);
            tw.call(change, self);
        };

        change();
    }

    /**
     * 切换描述内容
     * Switch to described content
     */
    private changeDescription(textfield:egret.TextField, textFlow:Array<egret.ITextElement>):void {
        textfield.textFlow = textFlow;
    }

}
