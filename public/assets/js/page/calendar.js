$(function () {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch("/todo-list", requestOptions)
        .then(response => response.text())
        .then(result => {
            // window.location.reload()
            console.log(JSON.parse(result))
            const events = [];
            JSON.parse(result).map(c => {

                switch (c.priority) {
                    case "High":
                        events.push({
                            title: c.todoName,
                            start: c.date.start,
                            end: c.date.end,
                            className: 'bg-danger'
                        })
                        break;
                    case "Medium":
                        events.push({
                            title: c.todoName,
                            start: c.date.start,
                            end: c.date.end,
                            className: 'bg-primary'
                        })
                        break;

                    default:
                        events.push({
                            title: c.todoName,
                            start: c.date.start,
                            end: c.date.end,
                            className: 'bg-secondary'
                        })
                        break;
                }

            })



            enableDrag();



            function enableDrag() {
                $('#external-events .fc-event').each(function () {
                    $(this).data('event', {
                        title: $.trim($(this).text()), // use the element's text as the event title
                        stick: true // maintain when user navigates (see docs on the renderEvent method)
                    });
                    // make the event draggable using jQuery UI
                    $(this).draggable({
                        zIndex: 999,
                        revert: true, // will cause the event to go back to its
                        revertDuration: 0 //  original position after the drag
                    });
                });
            }
            $(".save-event").on('click', function () {
                var categoryName = $('#addNewEvent form').find("input[name='category-name']").val();
                var categoryColor = $('#addNewEvent form').find("select[name='category-color']").val();
                if (categoryName !== null && categoryName.length != 0) {
                    $('#event-list').append('<div class="fc-event bg-' + categoryColor + '" data-class="bg-' + categoryColor + '">' + categoryName + '</div>');
                    $('#addNewEvent form').find("input[name='category-name']").val("");
                    $('#addNewEvent form').find("select[name='category-color']").val("");
                    enableDrag();
                }
            });
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1; //January is 0!
            var yyyy = today.getFullYear();
            if (dd < 10) {
                dd = '0' + dd
            }
            if (mm < 10) {
                mm = '0' + mm
            }
            var current = yyyy + '-' + mm + '-';
            var calendar = $('#calendar');
            // Add direct event to calendar
            var newEvent = function (start) {
                $('#addDirectEvent input[name="event-name"]').val("");
                $('#addDirectEvent select[name="event-bg"]').val("");
                $('#addDirectEvent').modal('show');
                $('#addDirectEvent .save-btn').unbind();
                $('#addDirectEvent .save-btn').on('click', function () {
                    var title = $('#addDirectEvent input[name="event-name"]').val();
                    var classes = 'bg-' + $('#addDirectEvent select[name="event-bg"]').val();
                    if (title) {
                        var eventData = {
                            title: title,
                            start: start,
                            className: classes
                        };
                        calendar.fullCalendar('renderEvent', eventData, true);
                        $('#addDirectEvent').modal('hide');
                    } else {
                        alert("Title can't be blank. Please try again.")
                    }
                });
            }
            // initialize the calendar
            calendar.fullCalendar({
                header: {
                    left: 'title',
                    center: '',
                    right: 'month, agendaWeek, agendaDay, prev, next'
                },
                editable: true,
                droppable: true,
                eventLimit: true, // allow "more" link when too many events
                selectable: true,
                events: events,
                drop: function (date, jsEvent) {
                    // var originalEventObject = $(this).data('eventObject');
                    // var $categoryClass = $(this).attr('data-class');
                    // var copiedEventObject = $.extend({}, originalEventObject);
                    // //console.log(originalEventObject + '--' + $categoryClass + '---' + copiedEventObject);
                    // copiedEventObject.start = date;
                    // if ($categoryClass)
                    //   copiedEventObject['className'] = [$categoryClass];
                    // calendar.fullCalendar('renderEvent', copiedEventObject, true);
                    // is the "remove after drop" checkbox checked?
                    if ($('#drop-remove').is(':checked')) {
                        // if so, remove the element from the "Draggable Events" list
                        $(this).remove();
                    }
                },
                select: function (start, end, allDay) {
                    newEvent(start);
                },
                eventClick: function (calEvent, jsEvent, view) {
                    //var title = prompt('Event Title:', calEvent.title, { buttons: { Ok: true, Cancel: false} });
                    var eventModal = $('#eventEditModal');
                    eventModal.modal('show');
                    eventModal.find('input[name="event-name"]').val(calEvent.title);
                    eventModal.find('.save-btn').click(function () {
                        calEvent.title = eventModal.find("input[name='event-name']").val();
                        calendar.fullCalendar('updateEvent', calEvent);
                        eventModal.modal('hide');
                    });
                    // if (title){
                    //     calEvent.title = title;
                    //     calendar.fullCalendar('updateEvent',calEvent);
                    // }
                }
            });

        })
        .catch(error => console.log('error', error));
});