from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    """
    This is the master Base class.
    Every database model we create will inherit from this.
    """
    pass