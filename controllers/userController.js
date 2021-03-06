const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const dbConnection = require("../utils/dbConnection");

// Home Page
exports.homePage = async (req, res, next) => {
    const [row] = await dbConnection.execute("SELECT * FROM `users` WHERE `id`=?", [req.session.userID]);

    if (row.length !== 1) {
        return res.redirect('/logout');
    }

    switch(row[0].role) {
				case 'borrower' : res.render('borrower', {user: row[0]});
								  break;
				
				case 'retaillender' : res.render('retaillender', {user: row[0]});
									  break;
									  
				case 'microfinance' : res.render('microcorp', {user: row[0]});
									  break;
				
				
			}
}

//Borrower Page
exports.borrowerPage = async (req, res, next) => {
    const [row] = await dbConnection.execute("SELECT * FROM `users` WHERE `id`=?", [req.session.userID]);

    if (row.length !== 1) {
        return res.redirect('/logout');
    }

	if(row[0].role == 'borrower'){
		res.render('borrower', {user: row[0]});
	}
	else {
		return res.redirect('/logout');
	}
	
}

//Retail Lender Page
exports.retailLenderPage = async (req, res, next) => {
    const [row] = await dbConnection.execute("SELECT * FROM `users` WHERE `id`=?", [req.session.userID]);

    if (row.length !== 1) {
        return res.redirect('/logout');
    }
	
	if(row[0].role == 'retaillender'){
		res.render('retaillender', {user: row[0]});
	}
	else {
		return res.redirect('/logout');
	}
}

//Microfinance Corp Page
exports.microcorpPage = async (req, res, next) => {
    const [row] = await dbConnection.execute("SELECT * FROM `users` WHERE `id`=?", [req.session.userID]);

    if (row.length !== 1) {
        return res.redirect('/logout');
    }
	
	if(row[0].role == 'microfinance'){
		res.render('microcorp', {user: row[0]});
	}
	else {
		return res.redirect('/logout');
	}
}

// Register Page
exports.registerPage = (req, res, next) => {
    res.render("register");
};

// User Registration
exports.register = async (req, res, next) => {
    const errors = validationResult(req);
    const { body } = req;

    if (!errors.isEmpty()) {
        return res.render('register', {
            error: errors.array()[0].msg
        });
    }

    try {

        const [row] = await dbConnection.execute(
            "SELECT * FROM `users` WHERE `email`=?",
            [body._email]
        );

        if (row.length >= 1) {
            return res.render('register', {
                error: 'This email is already in use.'
            });
        }

        const hashPass = await bcrypt.hash(body._password, 12);

        const [rows] = await dbConnection.execute(
            "INSERT INTO `users`(`name`,`email`,`password`, `role`) VALUES(?,?,?,?)",
            [body._name, body._email, hashPass, body._optradio]
        );

        if (rows.affectedRows !== 1) {
            return res.render('register', {
                error: 'Your registration has failed.'
            });
        }
        
        res.render("register", {
            msg: 'You have successfully registered.'
        });

    } catch (e) {
        next(e);
    }
};

// Login Page
exports.loginPage = (req, res, next) => {
    res.render("login");
};

// Login User
exports.login = async (req, res, next) => {

    const errors = validationResult(req);
    const { body } = req;

    if (!errors.isEmpty()) {
        return res.render('login', {
            error: errors.array()[0].msg
        });
    }

    try {

        const [row] = await dbConnection.execute('SELECT * FROM `users` WHERE `name`=?', [body._name]);

        if (row.length != 1) {
            return res.render('login', {
                error: 'Invalid Username'
            });
        }

        const checkPass = await bcrypt.compare(body._password, row[0].password);

        if (checkPass === true) {
            req.session.userID = row[0].id;
			switch(row[0].role) {
				case 'borrower' : return res.redirect('/borrower');
								  break;
				
				case 'retaillender' : return res.redirect('/retaillender');
									  break;
									  
				case 'microfinance' : return res.redirect('/microcorp');
									  break;
				
				
			}
        }

        res.render('login', {
            error: 'Invalid Password.'
        });


    }
    catch (e) {
        next(e);
    }

}