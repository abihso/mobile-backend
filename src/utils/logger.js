import winston from "winston";


const logger = winston.createLogger({
    level : "error",
    format : winston.format.json(),
    defaultMeta : {service  : "app service"},
    transports : [
        new winston.transports.File({filename : "error.txt", level : "error"}),
        new winston.transports.Console({ format : winston.format.colorize()}),
    ]
})

export default logger