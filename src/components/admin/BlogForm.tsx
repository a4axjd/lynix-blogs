
// Add a checkbox for sending newsletters when creating or updating a blog post

// Somewhere in your form component, add:
// <div className="flex items-center space-x-2 mt-2">
//   <Checkbox 
//     id="send-newsletter" 
//     checked={formData.sendNewsletter || false}
//     onCheckedChange={(checked) => setFormData({...formData, sendNewsletter: !!checked})}
//   />
//   <label 
//     htmlFor="send-newsletter" 
//     className="text-sm cursor-pointer">
//     Send newsletter to subscribers
//   </label>
// </div>
