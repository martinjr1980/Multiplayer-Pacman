module.exports = function Routes (app, io) {
	app.get('/', function (req, res) {
		res.render('index');
	})

	var time = 99;
	var users = {};
	var coins = [];
	var map = [
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
			[0,1,0,0,0,1,0,1,0,1,0,0,0,0,0,0,1,0,1,0,0,1,0,1,0,0,0,0,0,0,1,0,1,0,1,0,0,0,1,0],
			[0,1,0,1,1,1,0,1,0,1,0,1,1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,1,1,0,1,0,1,0,1,1,1,0,1,0],
			[0,1,0,1,0,0,0,1,0,1,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,1,0,1,0,0,0,1,0,1,0],
			[0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,0],
			[0,1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,1,0],
			[0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0],
			[0,1,1,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,1,1,0],
			[0,0,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,1,0,1,0,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,0,0],
			[1,1,1,1,1,0,1,0,0,1,0,1,0,0,1,0,1,1,1,1,0,1,0,1,0,1,0,1,0,0,1,0,1,1,0,1,1,1,1,1],
			[0,0,1,0,1,0,1,1,1,1,0,1,1,0,1,0,1,1,1,1,0,1,0,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,0,0],
			[0,1,1,0,1,0,1,1,1,1,0,1,1,0,1,0,0,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0],
			[0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0],
			[0,1,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,1,0],
			[0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0],
			[0,1,0,1,0,0,0,1,0,1,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,1,0,1,0,0,0,1,0,1,0],
			[0,1,0,1,1,1,0,1,0,1,0,1,1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,1,1,0,1,0,1,0,1,1,1,0,1,0],
			[0,1,0,0,0,1,0,1,0,1,0,0,0,0,0,0,1,0,1,0,0,1,0,1,0,0,0,0,0,0,1,0,1,0,1,0,0,0,1,0],
			[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
	];

	for (var i=0; i<map.length; i++){
		for (var j=0; j<map[i].length; j++){
			if (map[i][j] == 1){
				var posY = i*30+42;
				var posX = j*30+12;
				var id = (posY-12).toString() + '-' + (posX-12).toString();
				coins.push({id: id, x: posX, y: posY});
			}
		}
	}

	function timeLoop() {
	    time--;
	}

	io.on('connection', function (socket) {
		socket.on('login', function (data) {
			mainTime = setInterval(timeLoop, 1000);

			var info = { x: 30, y: 60, pos: 39, id: socket.id, collision: false, power: false, score: 0 };
			var user = { name: data.name, info: info };
			socket.emit('current_user', { name: data.name, info: info, map: map, coins: coins, time: time });
			socket.emit('all_users', { users: users });
			socket.broadcast.emit('new_user', user);
			users[socket.id] = user;
		})

		socket.on('key_press', function (data) {
			users[data.info.id].info = data.info;
			socket.broadcast.emit('new_movement', { info: data.info });
		})

		socket.on('eat_coin', function (data) {
			for (var i in coins) {
				if (coins[i].id == data.coin_id) {
					coins.splice(i, 1);
				}
			}
			socket.broadcast.emit('update_coin', { coin_id: data.coin_id });
			io.emit('update_all_coins', { coins: coins });
		})

		socket.on('update_score', function (data) {
			users[data.id].score = data.score;
			socket.broadcast.emit('broadcast_score', { id: data.id, score: data.score });
		})

		socket.on('winner', function (data) {
			socket.broadcast.emit('game_over', { name: data.name });
		})

		socket.on('disconnect', function (req) {
			delete users[socket.id];
			socket.broadcast.emit('remove_user', { id: socket.id });
		})
	});	
}
