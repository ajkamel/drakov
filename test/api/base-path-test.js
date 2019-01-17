var helper = require('../lib');
var request = helper.getRequest();

describe('Base-Path-Key', function(){
    before(function (done) {
        helper.drakov.run({sourceFiles: 'test/example/md/base-path/*.md', basePathKey:'SERVICE'}, done);
    });

    after(function (done) {
        helper.drakov.stop(done);
    });

    describe('/basepath1/things', function(){
        describe('GET', function(){
            it('should respond with json collection from contract example', function(done){
                request.get('/basepath1/things')
                .expect(200)
                .expect('Content-type', 'application/json;charset=UTF-8')
                .expect([
                    {text:'Zip2',id: '1'},
                    {text: 'X.com', id: '2'},
                    {text: 'SpaceX', id: '3'},
                    {text: 'Solar City', id: '4'},
                    {text: 'Hyperloop', id: '5'}
                ])
                .end(helper.endCb(done));
            });
        });
        describe('POST', function(){
            it('should respond with json object from contract example', function(done){
                request.post('/basepath1/things')
                .set('Content-type', 'application/json')
                .send({text: 'Hyperspeed jet'})
                .expect(200)
                .expect('Content-type', 'application/json;charset=UTF-8')
                .expect({text: 'Hyperspeed jet', id: '1'})
                .end(helper.endCb(done));
            });
        });
    });

    describe('/basepath2/things', function(){
        describe('GET', function(){
            it('should respond with json collection from contract example', function(done){
                request.get('/basepath2/things')
                .expect(200)
                .expect('Content-type', 'application/json;charset=UTF-8')
                .expect([
                        {'text':'NES', 'id': '1'},
                        { 'text':'Atari','id': '2'},
                        {'text':'The Beatles', 'id': '3'},
                        {'text':'Grandma','id': '4'},
                        {'text':'80s','id': '5'}
                    ])
                .end(helper.endCb(done));
            });
        });
        describe('POST', function(){
            it('should respond with json object from contract example', function(done){
                request.post('/basepath2/things')
                .set('Content-type', 'application/json')
                .send({text: 'Hyperspeed boat'})
                .expect(200)
                .expect('Content-type', 'application/json;charset=UTF-8')
                .expect({text: 'Hyperspeed boat', id: '2'})
                .end(helper.endCb(done));
            });
        });
    });

    describe('/noBase', function(){
        describe('GET', function(){
            it('should respond with json collection from contract example', function(done){
                request.get('/noBase')
                .expect(200)
                .expect('Content-type', 'application/json;charset=UTF-8')
                .expect({text:'noBase'})
                .end(helper.endCb(done));
            });
        });
    });
});
