CREATE TABLE users (
	id VARCHAR NOT NULL, 
	name VARCHAR NOT NULL, 
	email VARCHAR NOT NULL, 
	hashed_password VARCHAR NOT NULL, 
	profile_photo VARCHAR, 
	bio TEXT, 
	college VARCHAR, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	UNIQUE (email)
);
CREATE TABLE portfolios (
	id VARCHAR NOT NULL, 
	user_id VARCHAR NOT NULL, 
	virtual_cash FLOAT, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	UNIQUE (user_id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);
CREATE TABLE groups (
	id VARCHAR NOT NULL, 
	name VARCHAR NOT NULL, 
	invite_code VARCHAR NOT NULL, 
	vote_mode VARCHAR, 
	virtual_corpus FLOAT, 
	created_by VARCHAR NOT NULL, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	UNIQUE (invite_code), 
	FOREIGN KEY(created_by) REFERENCES users (id)
);
CREATE TABLE holdings (
	id VARCHAR NOT NULL, 
	portfolio_id VARCHAR NOT NULL, 
	ticker VARCHAR NOT NULL, 
	quantity FLOAT NOT NULL, 
	avg_buy_price FLOAT NOT NULL, 
	last_updated DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	FOREIGN KEY(portfolio_id) REFERENCES portfolios (id)
);
CREATE TABLE trades (
	id VARCHAR NOT NULL, 
	portfolio_id VARCHAR NOT NULL, 
	ticker VARCHAR NOT NULL, 
	action VARCHAR(4) NOT NULL, 
	quantity FLOAT NOT NULL, 
	price FLOAT NOT NULL, 
	total_value FLOAT NOT NULL, 
	rsi_at_trade FLOAT, 
	volume_trend VARCHAR, 
	ai_analysis TEXT, 
	mistake_flags TEXT, 
	executed_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	FOREIGN KEY(portfolio_id) REFERENCES portfolios (id)
);
CREATE TABLE group_members (
	id VARCHAR NOT NULL, 
	group_id VARCHAR NOT NULL, 
	user_id VARCHAR NOT NULL, 
	units_held FLOAT, 
	contribution FLOAT, 
	is_active BOOLEAN, 
	joined_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	FOREIGN KEY(group_id) REFERENCES groups (id), 
	FOREIGN KEY(user_id) REFERENCES users (id)
);
CREATE TABLE group_holdings (
	id VARCHAR NOT NULL, 
	group_id VARCHAR NOT NULL, 
	ticker VARCHAR NOT NULL, 
	quantity FLOAT NOT NULL, 
	avg_buy_price FLOAT NOT NULL, 
	last_updated DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	FOREIGN KEY(group_id) REFERENCES groups (id)
);
CREATE TABLE proposals (
	id VARCHAR NOT NULL, 
	group_id VARCHAR NOT NULL, 
	proposed_by VARCHAR NOT NULL, 
	ticker VARCHAR NOT NULL, 
	action VARCHAR(4) NOT NULL, 
	quantity FLOAT NOT NULL, 
	price_at_proposal FLOAT NOT NULL, 
	rationale TEXT, 
	status VARCHAR(8), 
	expires_at DATETIME NOT NULL, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	FOREIGN KEY(group_id) REFERENCES groups (id), 
	FOREIGN KEY(proposed_by) REFERENCES users (id)
);
CREATE TABLE votes (
	id VARCHAR NOT NULL, 
	proposal_id VARCHAR NOT NULL, 
	voter_id VARCHAR NOT NULL, 
	vote VARCHAR(18) NOT NULL, 
	voted_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	FOREIGN KEY(proposal_id) REFERENCES proposals (id), 
	FOREIGN KEY(voter_id) REFERENCES users (id)
);
