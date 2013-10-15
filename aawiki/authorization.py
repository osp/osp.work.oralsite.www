from django.contrib.auth.models import User, AnonymousUser

from tastypie.authorization import Authorization
from tastypie.exceptions import Unauthorized

from guardian.shortcuts import get_objects_for_user

def get_user(bundle):
    """
    By convention, Gaurdian stores an AnonymousUser under ID -1

    If the user is not logged in, we need to explicitly state they are
    AnonymousUser, so that they get the necessary permissions.
    """
    if not hasattr(bundle.request, 'user') or isinstance(bundle.request.user, AnonymousUser):
        return User.objects.get(pk=-1)
    else:
        return bundle.request.user


class PerPageAuthorization(Authorization):
    def read_list(self, object_list, bundle):
        pages = get_objects_for_user(get_user(bundle), 'aawiki.view_page')
        return pages
    
    def read_detail(self, object_list, bundle):
        return get_user(bundle).has_perm('view_page', bundle.obj)
    
    def create_list(self, object_list, bundle):
        # Currently not used in Tastypie
        raise NotImplementedError()
    
    def create_detail(self, object_list, bundle):
        return get_user(bundle).has_perm('add_page', bundle.obj)
    
    def update_list(self, object_list, bundle):
        pages = get_objects_for_user(get_user(bundle), 'aawiki.change_page')
        return pages
    
    def update_detail(self, object_list, bundle):
        return get_user(bundle).has_perm('change_page', bundle.obj)
    
    def delete_list(self, object_list, bundle):
        raise Unauthorized("Sorry, no deletes.")
    
    def delete_detail(self, object_list, bundle):
        raise Unauthorized("Sorry, no deletes.")
    
class PerAnnotationAuthorization(Authorization):
    def read_list(self, object_list, bundle):
        permitted_pages = get_objects_for_user(get_user(bundle), 'aawiki.view_page')
        permitted_ids = []
        for p in permitted_pages:
            permitted_ids.append(p.id)
        return object_list.filter(page__id__in=permitted_ids)
    
    def read_detail(self, object_list, bundle):
        return get_user(bundle).has_perm('view_page', bundle.obj.page)
    
    def create_list(self, object_list, bundle):
        # Currently not used in Tastypie
        raise NotImplementedError()
    
    def create_detail(self, object_list, bundle):
        return get_user(bundle).has_perm('add_page', bundle.obj.page)
    
    def update_list(self, object_list, bundle):
        permitted_pages = [i.id for i in get_objects_for_user(get_user(bundle), 'aawiki.change_page')]
        return object_list.filter(page__id__in=permitted_pages)
    
    def update_detail(self, object_list, bundle):
        return get_user(bundle).has_perm('change_page', bundle.obj.page)
    
    def delete_list(self, object_list, bundle):
        raise Unauthorized("Sorry, no deletes.")
    
    def delete_detail(self, object_list, bundle):
        raise Unauthorized("Sorry, no deletes.")
