CREATE TABLE IF NOT EXISTS global_partners (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name TEXT NOT NULL,
image_url TEXT,
order_index INTEGER DEFAULT 0,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tool_room_machines (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name TEXT NOT NULL,
specs TEXT NOT NULL,
type TEXT NOT NULL,
image_url TEXT,
is_active BOOLEAN DEFAULT true,
order_index INTEGER DEFAULT 0,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vision_mission (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
title TEXT NOT NULL,
description TEXT NOT NULL,
icon_name TEXT NOT NULL,
order_index INTEGER DEFAULT 0,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leadership_team (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name TEXT NOT NULL,
role TEXT NOT NULL,
order_index INTEGER DEFAULT 0,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS operations_team (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name TEXT NOT NULL,
role TEXT NOT NULL,
order_index INTEGER DEFAULT 0,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
); 