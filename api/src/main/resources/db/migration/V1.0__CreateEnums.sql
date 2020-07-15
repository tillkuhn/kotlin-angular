-- DDL for common enumerations
CREATE TYPE area_level AS ENUM ('PLANET','CONTINENT', 'CONT_SECT', 'COUNTRY','REGION');
CREATE TYPE location_type AS ENUM ( 'PLACE','ACCOM','BEACH','CITY','EXCURS','MONUM','MOUNT','ROAD');
CREATE TYPE auth_scope AS ENUM ( 'PUBLIC','ALL_AUTH','PRIVATE');
