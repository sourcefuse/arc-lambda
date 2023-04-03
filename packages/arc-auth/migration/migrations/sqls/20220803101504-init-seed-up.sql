/* Replace with your SQL commands */

SET search_path TO main,public;

insert into auth_clients
(client_id, client_secret, secret)
values
    ('webapp','saqw21!@', 'plmnkoqazxsw');

insert into roles
(name, permissions, role_type)
values
    ('Platform Admin', '{}', 0);


insert into tenants
(name, status, key)
values
    ('Travelex', 1, 'master');


insert into users
(first_name, last_name, username, email, default_tenant_id)
select 'Platform', 'Admin', 'platform.admin@yopmail.com', 'platform.admin@yopmail.com', id from tenants where key = 'master' ;
insert into user_tenants
(user_id, tenant_id, status, role_id)
select (select id from users where username = 'platform.admin@yopmail.com'), (select id from tenants where key = 'master'), 1, id from roles where role_type = 0;
insert into user_credentials
(user_id, auth_provider, password)
select U.id, 'internal', '$2a$10$TOLMGK43MjbibS8Jap2RXeHl3.4sJcR3eFbms2dBll2LTMggSK9hG' from users U where U.username = 'platform.admin@yopmail.com';

update users set auth_client_ids = array_cat(auth_client_ids, ARRAY[(select id from auth_clients where client_id = 'webapp')::integer]);
