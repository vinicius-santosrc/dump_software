// es
// tslint:disable: max-line-length
export const locale = {
    lang: "es",
    data: {
        AUTH: {
            HIGHLIGHT_MESSAGE: "Comparte y sigue momentos con quienes ",
            HIGHLIGHT_MESSAGE_2: "realmente importan.",
            GOOGLE_SIGN_IN: "Iniciar sesión con Google",
            JOIN_DUMP: "Iniciar sesión en Dump",
            FORGOT_PASSWORD: "Recuperar cuenta",
            INPUTS: {
                EMAIL: "Número de teléfono, nombre de usuario o email",
                EMAIL_SIGN_UP: "Número de teléfono o email",
                PASSWORD: "Contraseña",
                FULL_NAME: "Nombre completo",
                DATE_OF_BIRTH: "Fecha de nacimiento"
            },
            BUTTONS: {
                SIGN_IN: "Iniciar sesión",
                FORGOT_PASSWORD: "¿Olvidaste tu contraseña?",
                SIGN_UP: "Crear nueva cuenta",
                SIGN_IN_ALREADY_HAVE_ACCOUNT: "¿Ya tienes una cuenta? Iniciar sesión",
                CONTINUE: "Continuar"
            }
        },
        HEADER: {
            ACTIONS: {
                SIDEBAR: {
                    TITLE: "DUMP",
                    EXPLORE: "Explorar",
                    MESSAGES: "Conversaciones",
                    HOME: "Inicio",
                    DUMPS: "Dumps",
                    SEARCH: "Buscar",
                    ALERTS: "Notificaciones",
                    SAVES: "Guardados",
                    ADD_POST: "Nuevo dump",
                    ADD_POST_MENU: {
                        POST: "Publicar",
                        STORY: "Crear story",
                        LIVE: "Iniciar live",
                        AD: "Anunciar",
                        IA: "IA"
                    },
                    PROFILE: "Perfil",
                    MENU: "Menú",
                    MENU_OPTIONS: {
                        SETTINGS: "Configuración",
                        ACTIVITY: "Actividad",
                        SAVES: "Guardados",
                        DISPLAY: "Pantalla",
                        REPORT: "Reportar un problema",
                        CHANGE_ACCOUNT: "Cambiar de cuenta",
                        DISCONNECT: "Cerrar sesión",
                    },
                    SETTINGS: "Ajustes",
                },
                CONVERSATIONS: "Conversaciones"
            }
        },
        SIDEBAR: {
            NOTIFICATIONS_SIDEBAR: {
                HEADER: "Notificaciones",
                ACTIONS: {
                    ALL: "Marcar todo como leído",
                    SETTINGS: "Configuración de notificaciones",
                    LIKE: "le gustó tu publicación",
                    COMMENT: "comentó en tu publicación",
                },
                EMPTY: "Aún no hay notificaciones."
            },
            THEME_CHANGE: {
                CHANGE_THEME: "Cambiar visualización",
                THEME: {
                    DARK: "Modo oscuro"
                }
            }
        },
        COMPONENTS: {
            BASIC_INPUT: {
                DEFAULT_SEARCH: "Buscar"
            }
        },
        LANGUAGES: {
            PT_BR: "Portugués (Brasil)",
            EN_US: "Inglés (Estados Unidos)",
            ES: "Español"
        },
        FOOTER: {
            BUTTONS: {
                ABOUT: "Acerca de",
                BLOG: "Blog",
                API: "API",
                HELP: "Ayuda",
                PRIVACY: "Privacidad",
                TERMS: "Términos",
                LOCALIZATIONS: "Ubicaciones",
            }
        },
        VALIDATIONS: {
            REQUIRED: "Este campo es obligatorio.",
            INVALID_EMAIL: "Ingresa un email válido.",
            MIN_LENGTH: "Este campo debe contener al menos {{minLength}} caracteres.",
            MAX_LENGTH: "Este campo debe contener como máximo {{maxLength}} caracteres."
        },
        ERRORS: {
            DEFAULT: "Ocurrió un error inesperado.",
            NETWORK: "Error de conexión. Revisa tu internet.",
            OFFLINE: "Estás sin conexión.",
            BAD_REQUEST: "Solicitud inválida.",
            FORBIDDEN: "No tienes permiso para esta acción.",
            NOT_FOUND: "Recurso no encontrado.",
            SERVER_ERROR: "Error interno del servidor.",
            CONFLICT: "Conflicto al procesar la solicitud.",
            CLOSE: "Cerrar"
        },
        FEED: {
            HEADER: {
                FOR_YOU: "Para ti",
                FOLLOWING: "Siguiendo"
            },
            MEMORIES: {
                ADD: "Agregar memoria",
                YOURS: "Tu memoria"
            },
            POST: {
                FOLLOW: "Seguir",
                COMMENTS: {
                    EMPTY: "Aún no hay comentarios. ¡Sé el primero en comentar!",
                    TITLE: "Comentarios",
                    ADD: "Agregar un comentario",
                    ITEM: {
                        REPLY: "Responder",
                        SEND: "Enviar",
                        CANCEL: "Cancelar"
                    },
                    DELETED: "Comentario eliminado",
                    SHOW_RESPONSES: "+ Ver respuestas ({{count}})",
                    LOADING: "Cargando...",
                    HIDE_RESPONSES: "Ocultar respuestas"
                },
                SHARE: {
                    HEADER: "Compartir",
                    LABEL: "Buscar conversaciones",
                    SEND: "Enviar por separado ({{count}})",
                    NO_CONVERSATIONS: "No se encontraron conversaciones"
                },
                ACTIONS: {
                    COMMENT: "Comentar",
                    REPOST: "Republicar",
                    SEND: "Enviar a amigos",
                    SAVE: "Guardar",
                    OPTIONS: "Opciones",
                    CANCEL: "Cancelar",
                    ARCHIVE: "Archivar",
                    UNARCHIVE: "Desarchivar",
                    DELETE: "Eliminar",
                    ABOUT: "Acerca de esta cuenta",
                    WHY: "Por qué ves esta publicación",
                    HIDE: "Ocultar",
                    REPORT: "Denunciar"
                },
                POST_ARCHIVED: "Publicación archivada.",
                POST_DELETED: "Publicación eliminada.",
                POST_UNARCHIVED: "Publicación desarchivada."
            },
            CARD: {
                WHO_FOLLOW: "a quién seguir",
                TENDING_TOPICS: "de qué se está hablando",
                SEE_ALL: "Ver todo",
                BUTTON: {
                    FOLLOW: "Conectar",
                    TALK: "Conversar",
                    UNFOLLOW: "Conectado",
                    MORE_INFO: "Saber más",
                    OF_POSTS: "de publicaciones"
                }
            }
        },
        IMAGE_DRAG_AND_DROP: {
            INSTRUCTION: "Arrastra fotos o videos aquí",
            SELECTED: "{{count}} archivo(s) seleccionado(s)",
            BUTTON: "Seleccionar desde el dispositivo"
        },
        CREATE_POST: {
            HEADER: "Crear nueva publicación",
            CAPTION: "Ingresa una descripción para tu publicación",
            FIELDS: {
                AUDIO: "Agregar audio",
                LOCATION: "Agregar ubicación",
                TAG_PEOPLE: "Etiquetar personas",
                IA: "Agregar etiqueta de IA",
                PUBLIC: "Público",
                TOGGLE_COMMENTS: "Desactivar comentarios",
                HIDE_LIKES: "Ocultar Me gusta",
                SCHEDULE: "Programar publicación"
            },
            BUTTON: {
                SHARE: "Compartir",
                ADD_MEDIA: "Agregar más medios",
            }
        },
        NOT_FOUND: {
            MESSAGE: "Esta página no está disponible.",
            DESCRIPTION: "El enlace en el que hiciste clic puede no funcionar, o la página pudo haber sido eliminada.",
            LINK: "Volver a Dump."
        },
        SEARCH: {
            HEADER: "Búsqueda",
            LABEL: "Busca usuarios, publicaciones o temas",
            RECENT: "Recientes",
            CLEAR_ALL: "Limpiar todo",
            SECTION: {
                USERS: "Usuarios",
                POSTS: "Publicaciones",
                TOPICS: "Temas"
            }
        },
        EXPLORE: {
            SEARCH: {
                PLACEHOLDER: "Buscar temas, publicaciones, usuarios y más..."
            },
            EMPTY: {
                TITLE: "No se encontró nada",
                DESCRIPTION: "Intenta buscar otro tema o navegar por las tendencias."
            },
            SECTION: {
                SEE_MORE: "ver más",
                SEE_LESS: "ver menos"
            },
            MODAL: {
                CLOSE: "Cerrar",
                FILTERS: {
                    RECENT: "Más recientes",
                    MOST_LIKED: "Más populares",
                    VIDEOS_ONLY: "Solo videos",
                    SMALL_CREATORS: "Creadores pequeños",
                    NEAR_YOU: "Cerca de ti"
                }
            },
            POST: {
                RELEVANT_SCORE: "{{score}} relevante"
            },
            ENGAGEMENT_LAB: {
                ARIA_LABEL: "Exploración social",
                STICKERS_TITLE: "Stickers en tendencia",
                MOCK_BADGE: "mock",
                SOCIAL_TITLE: "Personas que sigues dieron Me gusta",
                SOCIAL_BADGE: "prueba social"
            }
        },
        USER_PROFILE: {
            TABS: {
                POSTS: "Publicaciones",
                LIKES: "Me gusta",
                MEDIA: "Medios"
            },
            INFORMATION: {
                FOLLOWING: "{{count}} siguiendo",
                FOLLOWERS: "{{count}} seguidores",
            },
            FEED: {
                EMPTY: "No se encontraron publicaciones.",
            },
            MODAL: {
                FOLLOWING: {
                    TITLE: "Siguiendo",
                    SUBTITLE: "Mira a quién sigue {{username}}.",
                },
                FOLLOWERS: {
                    TITLE: "Seguidores",
                    SUBTITLE: "Mira quién sigue a {{username}}.",
                }
            },
            EDIT_PROFILE: {
                HEADER: "Editar perfil",
                SUBTITLE: "Completa los pasos a continuación para actualizar tu perfil.",
                TABS: {
                    PROFILE: "Perfil"
                },
                FORM: {
                    NAME: "Nombre",
                    NAME_PLACEHOLDER: "Cambia tu nombre",
                    USERNAME: "Usuario",
                    USERNAME_PLACEHOLDER: "Cambia tu nombre de usuario",
                    BIO: "Biografía",
                    BIO_PLACEHOLDER: "Cambia tu biografía",
                    WEBSITE: "Sitio web",
                    WEBSITE_PLACEHOLDER: "Agrega un sitio web a tu perfil",
                    GENDER: "Género",
                    GENDER_OPTIONS: {
                        MALE: "Masculino",
                        FEMALE: "Femenino",
                        OTHER: "Otro",
                        PREFER_NOT_TO_SAY: "Prefiero no decirlo"
                    },
                    AVATAR: {
                        CHANGE: "Cambiar foto de perfil",
                        REMOVE: "Eliminar foto de perfil"
                    },
                    WARNING_GENDER: "Esto no formará parte de tu perfil público."
                },
                ARCHIVED: {
                    TITLE: "Archivadas",
                    SUBTITLE: "Aquí están las publicaciones que archivaste. No son visibles para otras personas.",
                    EMPTY: "No hay publicaciones archivadas"
                },
                BUTTON: {
                    UPDATE: "Actualizar"
                }
            }
        },
        MESSAGES_INBOX: {
            SIDEBAR: {
                CONVERSATIONS: "Conversaciones",
                ADD_CONVERSATION: {
                    HEADER: "Nueva conversación",
                    LABEL: "Buscar usuarios",
                    NO_USERS: "No se encontraron usuarios",
                    CREATE: "Crear conversación"
                },
                TABS: {
                    PRINCIPAL: "Principal",
                    GENERAL: "General",
                    REQUESTS: "Solicitudes"
                },
                SEARCH: "Buscar conversaciones",
                LAST_MESSAGE: "Tú",
                LAST_MESSAGE_SENT_POST: "envió un adjunto",
                LAST_MESSAGE_SENT_IMAGE: "envió una foto",
                LAST_MESSAGE_SENT_VIDEO: "envió un video",
                LAST_MESSAGE_SENT_AUDIO: "envió un audio",
                LAST_MESSAGE_SENT_STICKER: "envió un sticker"
            },
            CHAT: {
                INPUT: {
                    PLACEHOLDER: "Escribe un mensaje...",
                },
                BUTTON: {
                    SEND: "Enviar",
                    RESEND: "Reenviar",
                    SEE_STORY: "Ver story",
                },
                ACTIONS: {
                    REACT: "Reaccionar",
                    REPLY: "Responder",
                    MORE_OPTIONS: "Más opciones",
                    INFO: "Información de la conversación"
                },
                CALL: {
                    AUDIO: "Iniciar llamada de audio",
                    VIDEO: "Iniciar videollamada"
                },
                DATE: {
                    TODAY: "Hoy",
                    YESTERDAY: "Ayer"
                },
                MEDIA: {
                    OPEN_IMAGE: "Abrir imagen",
                    STICKER_ALT: "Sticker",
                    AVATAR_ALT: "Avatar del usuario"
                },
                COMPOSER: {
                    ATTACHMENT: {
                        IMAGE_ALT: "Imagen adjunta",
                        IMAGE_ATTACHED: "Imagen adjunta",
                        REMOVE_IMAGE: "Eliminar imagen"
                    },
                    ACTIONS: {
                        EMOJI: "Emoji",
                        MICROPHONE: "Micrófono",
                        IMAGE: "Imagen",
                        STICKER: "Sticker"
                    },
                    RECORDING: {
                        CANCEL: "Cancelar"
                    }
                },
                AUDIO: {
                    PLAY: "Reproducir audio",
                    PAUSE: "Pausar audio",
                    CHANGE_SPEED: "Cambiar velocidad del audio"
                },
                STICKERS: {
                    TITLE: "Stickers",
                    SUBTITLE: "Elige o crea un sticker",
                    CREATE: "Crear sticker",
                    SELECT: "Seleccionar sticker {{name}}",
                    ADD_FAVORITE: "Agregar {{name}} a favoritos",
                    REMOVE_FAVORITE: "Quitar {{name}} de favoritos",
                    REMOVE_CUSTOM: "Eliminar sticker {{name}}",
                    EMPTY_RECENT: "No hay stickers recientes",
                    EMPTY_FAVORITES: "Aún no hay favoritos"
                },
                MESSAGE: {
                    DELETED: "Mensaje eliminado"
                },
                POST: {
                    SHARED: "Compartido",
                    USER: "Usuario",
                    SENT: "Enviado",
                    DELIVERED: "Entregado",
                    READ: "Leído",
                    UNAVAILABLE: "La publicación ya no está disponible"
                },
                STORY: {
                    LABEL: "Story",
                    ALT: "Story",
                    UNAVAILABLE: "El story ya no está disponible"
                }
            },
            NOT_SELECTED: {
                TITLE: "Tus mensajes",
                SUBTITLE: "Selecciona una conversación para leer los mensajes",
                BUTTON: "Escribe un mensaje",
                ILLUSTRATION_ALT: "Ilustración de mensaje enviado",
            }
        },
        CALL: {
            PRE_CALL: {
                CAMERA_PREVIEW: "Vista previa de la cámara",
                ACTIONS: {
                    TOGGLE_CAMERA: "Activar o desactivar cámara",
                    TOGGLE_MICROPHONE: "Activar o desactivar micrófono",
                    VOLUME: "Configurar volumen",
                    SETTINGS: "Configuración de la llamada"
                },
                STATUS: {
                    CALLING: "Llamando...",
                    RINGING: "Sonando...",
                    CONNECTED: "Conectado",
                    REJECTED: "Llamada rechazada",
                    UNAVAILABLE: "Usuario no disponible",
                    ENDED: "Llamada finalizada",
                    READY_VIDEO: "¿Todo listo para la videollamada?",
                    READY_AUDIO: "¿Todo listo para llamar?"
                },
                BUTTONS: {
                    CALLING: "Llamando...",
                    REJECTED: "Rechazada",
                    START: "Iniciar llamada"
                }
            },
            INCOMING: {
                AVATAR_ALT: "Avatar de quien llama",
                RECEIVED: "Llamada entrante",
                FALLBACK_USER: "Usuario",
                VIDEO: "Videollamada",
                AUDIO: "Llamada de audio",
                REJECT: "Rechazar llamada",
                ACCEPT: "Aceptar llamada"
            }
        },
    }
};