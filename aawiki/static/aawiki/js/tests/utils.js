describe("The AA utils", function() {

    it("can be found", function() {
        expect(AA.utils).toBeDefined();
    });
    
    describe("The utility toHash", function(){
        it("always produces the same result", function(){
            expect(AA.utils.toHash("Sherry Turkle")).toBe(1312915434);
        });
    });
    
    describe("The utility timecodeToSeconds", function() {
        it("knows how to handle timecode in the form of '01:44,738'", function() {
            expect(AA.utils.timecodeToSeconds('01:44,738')).toBe(104.738);
        });
    });

    describe("The utility path2mime", function(){
        it("knows to find a mime-type for a filename", function(){
            expect(AA.utils.path2mime("poster.jpg")).toBe("image/jpeg");
        });
        it("this also works for a url", function(){
            expect(AA.utils.path2mime("http://example.com/poster.jpg")).toBe("image/jpeg");
        });
        it("if there is no extension, it as served as `application/octet-stream`", function(){
            expect(AA.utils.path2mime("http://example.com/poster")).toBe("application/octet-stream");
        });
        it("this is also the case if the extension is not recognised", function(){
            expect(AA.utils.path2mime("http://example.com/poster.some-proprietary-extension")).toBe("application/octet-stream");
        });
    });
  
  
});
